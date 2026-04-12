// backend/routes/intake.js
// ─────────────────────────────────────────────────────────────────────────────
// MediTriage — Intake Routes
// POST /api/intake  → save form, run AI triage, update record, return result
// GET  /api/intake  → fetch all submissions (for admin/review)
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import Intake from "../models/Intake.js";
import { runTriageAgent } from "../services/triageAgent.js";
import { sendTriageConfirmation } from "../services/emailService.js";

const router = express.Router();

// ── POST /api/intake ─────────────────────────────────────────────────────────
// Called when a patient submits the intake form.
// Flow: validate → save to MongoDB → run AI triage → update record → respond
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    // STEP 1 — Save the raw intake form data first.
    // We save immediately (before AI) so that even if the AI call fails,
    // the patient's data is never lost. Good defensive practice.
    const intake = new Intake(req.body);
    await intake.save();

    // STEP 2 — Run the AI triage agent.
    // Pass the full intake object. runTriageAgent() sends it to Groq
    // and returns { urgency, urgencyReason, doctorSummary, extractedData }.
    // This await will pause for ~1-2 seconds while Groq responds.
    let triageResult;
    try {
      triageResult = await runTriageAgent(req.body);
    } catch (aiError) {
      // If the AI call fails (e.g. Groq is down, API key invalid),
      // we still return a 201 success — the patient data WAS saved.
      // We just flag that triage didn't complete so staff can follow up manually.
      console.error("Triage agent failed:", aiError.message);
      return res.status(201).json({
        message: "Intake saved, but AI triage failed. Manual review needed.",
        data: intake,
        triageError: aiError.message,
      });
    }

    // STEP 3 — Update the MongoDB document with the AI results.
    // intake._id is the unique ID MongoDB assigned when we saved in Step 1.
    // findByIdAndUpdate() finds that exact record and patches only these fields.
    // { new: true } means "return the updated document" (not the old one).
    const updated = await Intake.findByIdAndUpdate(
      intake._id,
      {
        urgency:       triageResult.urgency,
        urgencyReason: triageResult.urgencyReason,
        doctorSummary: triageResult.doctorSummary,
        extractedData: triageResult.extractedData,
      },
      { new: true }
    );

    // STEP 4 — Send confirmation email — fire and forget (don't await).
    // We don't await so a slow email send never delays the API response.
    sendTriageConfirmation({
      to:            updated.email,
      firstName:     updated.firstName,
      urgency:       updated.urgency,
      urgencyReason: updated.urgencyReason,
      doctorSummary: updated.doctorSummary,
      submittedDate: new Date(updated.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
    }).catch(err => console.error('Email send failed:', err.message));

    // STEP 5 — Send the fully triaged record back to the frontend.
    // HTTP 201 = "Created" — the standard status code for a successful POST
    // that resulted in a new resource being created.
    return res.status(201).json({
      message: "Intake saved and triaged successfully.",
      data: updated,
    });

  } catch (err) {
    // This catches unexpected errors (e.g. MongoDB connection issue, bad schema).
    console.error("POST /api/intake error:", err.message);
    return res.status(500).json({
      message: "Server error. Could not save intake.",
      error: err.message,
    });
  }
});

// ── GET /api/intake ──────────────────────────────────────────────────────────
// Returns all intake submissions, newest first.
// Useful for an admin dashboard or quick testing in the browser.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // -1 = descending order (newest first). 1 would be ascending (oldest first).
    const intakes = await Intake.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: intakes });
  } catch (err) {
    console.error("GET /api/intake error:", err.message);
    return res.status(500).json({ message: "Could not fetch intakes.", error: err.message });
  }
});

// ── PATCH /api/intake/:id/status ─────────────────────────────────────────────
// Updates only the status field of an existing intake record.
// Called from the doctor dashboard when staff changes a patient's status.
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Intake.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Intake not found." });
    }
    return res.status(200).json({ data: updated });
  } catch (err) {
    console.error("PATCH /api/intake/:id/status error:", err.message);
    return res.status(500).json({ message: "Could not update status.", error: err.message });
  }
});

// ── POST /api/intake/:id/retriage ────────────────────────────────────────────
// Re-runs AI triage on an existing intake record.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/retriage', async (req, res) => {
  try {
    const intake = await Intake.findById(req.params.id);
    if (!intake) {
      return res.status(404).json({ message: 'Intake not found' });
    }
    const { runTriageAgent } = await import('../services/triageAgent.js');
    const triageResult = await runTriageAgent(intake);
    const updated = await Intake.findByIdAndUpdate(
      req.params.id,
      {
        urgency:       triageResult.urgency,
        urgencyReason: triageResult.urgencyReason,
        doctorSummary: triageResult.doctorSummary,
        extractedData: triageResult.extractedData,
      },
      { new: true }
    );
    return res.status(200).json({ message: 'Re-triaged successfully', data: updated });
  } catch (err) {
    console.error('POST /api/intake/:id/retriage error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;