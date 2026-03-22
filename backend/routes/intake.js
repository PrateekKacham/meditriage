// routes/intake.js — handles all requests to /api/intake
//
// CONCEPT: What is a Route?
// ─────────────────────────
// A route is like a specific desk in an office.
// When a request comes in to /api/intake, Express sends it here.
// This file decides what to do based on the HTTP method:
//   POST → someone is submitting new data (patient submitting the form)
//   GET  → someone is requesting existing data (doctor loading the dashboard)
//
// HTTP Methods in plain English:
//   POST = "here is new data, please save it"
//   GET  = "please give me some data"
//   PUT  = "please update this existing data"
//   DELETE = "please delete this data"

import express from 'express';
import Intake from '../models/Intake.js'; // import our blueprint/model

const router = express.Router();
// Router is a mini Express app — it handles routes just for /api/intake


// ── POST /api/intake ────────────────────────────────────────────
// Called when a patient submits the intake form
// async/await means: "wait for the database operation to finish before continuing"
router.post('/', async (req, res) => {
  try {
    // req.body contains the JSON data sent from the React frontend
    // We destructure it — pulling out each field by name
    const {
      firstName, lastName, dateOfBirth, email, phone,
      chiefComplaint,
      symptoms, symptomDuration, painLevel,
      existingConditions, allergies, currentMedications,
    } = req.body;

    // Basic validation — if required fields are missing, stop and return an error
    // 400 = "Bad Request" — the client sent incomplete data
    if (!firstName || !lastName || !email || !chiefComplaint) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new Intake document using our schema
    // This is like filling out a form using the template
    const newIntake = new Intake({
      firstName, lastName, dateOfBirth, email, phone,
      chiefComplaint,
      symptoms,
      symptomDuration,
      painLevel: Number(painLevel), // convert to number in case it came as a string
      existingConditions,
      allergies,
      currentMedications,
    });

    // .save() writes the document to MongoDB Atlas
    // await means: wait here until MongoDB confirms it's saved
    await newIntake.save();

    // 201 = "Created" — the standard success code when new data is saved
    res.status(201).json({
      message: 'Intake submitted successfully',
      intake: newIntake,
    });

  } catch (err) {
    // If anything goes wrong (DB error, validation error etc.)
    // 500 = "Internal Server Error"
    console.error('Error saving intake:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ── GET /api/intake ─────────────────────────────────────────────
// Returns ALL intake submissions — used by the doctor dashboard in Phase 3
// We add it now so it's ready, even though the dashboard isn't built yet
router.get('/', async (req, res) => {
  try {
    // .find() with no arguments = get everything
    // .sort({ createdAt: -1 }) = newest first (-1 means descending)
    const intakes = await Intake.find().sort({ createdAt: -1 });
    res.json(intakes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ── GET /api/intake/:id ─────────────────────────────────────────
// Returns ONE intake by its MongoDB ID
// :id is a URL parameter — e.g. /api/intake/64abc123...
// Used in Phase 3 when a doctor clicks on a specific patient
router.get('/:id', async (req, res) => {
  try {
    // req.params.id captures the :id part of the URL
    const intake = await Intake.findById(req.params.id);

    // If no intake found with that ID, return 404 Not Found
    if (!intake) return res.status(404).json({ message: 'Intake not found' });

    res.json(intake);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


export default router;