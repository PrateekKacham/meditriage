// models/Intake.js — defines the shape of data we save to MongoDB
//
// CONCEPT: Schema vs Model vs Document
// ─────────────────────────────────────
// Schema   → the blueprint (what fields exist, what types they are)
// Model    → the tool you use to interact with the database using that blueprint
// Document → one actual record saved in the database (like one row in a spreadsheet)
//
// Real world analogy:
// Schema   = a job application form template
// Model    = the filing cabinet for those forms
// Document = one filled-out application form inside the cabinet

import mongoose from 'mongoose';

const IntakeSchema = new mongoose.Schema(
  {
    // ── Step 1: Personal info ──────────────────────────────
    firstName:   { type: String, required: true },  // required: true means this field MUST exist
    lastName:    { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    email:       { type: String, required: true },
    phone:       { type: String },                  // no required = optional field

    // ── Step 2: Chief complaint ────────────────────────────
    // The main reason the patient is visiting today
    chiefComplaint: { type: String, required: true },

    // ── Step 3: Symptoms ──────────────────────────────────
    // Arrays store multiple values e.g. ["Headache", "Fever", "Cough"]
    symptoms:        [{ type: String }],
    symptomDuration: { type: String },              // e.g. "3 days"
    painLevel:       { type: Number, min: 1, max: 10 }, // number between 1 and 10

    // ── Step 4: Medical history ────────────────────────────
    existingConditions: [{ type: String }],         // e.g. ["Diabetes", "Asthma"]
    allergies:          [{ type: String }],         // e.g. ["Penicillin"]
    currentMedications: [{ type: String }],         // e.g. ["Metformin 500mg"]

    // ── Doctor dashboard status (used in Phase 3) ─────────
    // We define this now so the field is ready when we need it
    // enum means only these exact values are allowed
    status: {
      type: String,
      enum: ['pending', 'seen', 'needs-follow-up'],
      default: 'pending', // every new intake starts as "pending"
    },

    // ── AI triage fields (used in Phase 2) ────────────────
    // These are all null in Phase 1 — Claude will fill them in Phase 2
    urgency:       { type: String, enum: ['Emergency', 'Urgent', 'Semi-Urgent', 'Non-Urgent'], default: null },
    urgencyReason: { type: String, default: null }, // one sentence explaining why
    department:    { type: String, default: null }, // which department the AI routed this patient to
    doctorSummary: { type: String, default: null }, // paragraph Claude generates
    extractedData: { type: mongoose.Schema.Types.Mixed, default: null }, // Claude's full JSON
    // Mixed type = can store any shape of data (object, array, etc.)
  },
  {
    // timestamps: true automatically adds two fields to every document:
    // createdAt → when the intake was submitted
    // updatedAt → when it was last modified
    timestamps: true,
  }
);

// Create the Model from the Schema
// 'Intake' is the model name — MongoDB will create a collection called 'intakes' (lowercase + plural)
export default mongoose.model('Intake', IntakeSchema);