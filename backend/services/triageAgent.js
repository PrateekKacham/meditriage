// backend/services/triageAgent.js
// ─────────────────────────────────────────────────────────────────────────────
// MediTriage — AI Triage Agent
// Sends patient intake data to Groq (Llama 3) and returns structured results.
// ─────────────────────────────────────────────────────────────────────────────

import Groq from "groq-sdk";

// Create one Groq client instance. It automatically reads GROQ_API_KEY
// from your .env file (loaded by dotenv in server.js).
const groq = new Groq();

// ── The main exported function ───────────────────────────────────────────────
// intakeData: the full patient object saved in MongoDB (req.body from the form)
// Returns: an object with { urgency, urgencyReason, doctorSummary, extractedData }
// ────────────────────────────────────────────────────────────────────────────
export async function runTriageAgent(intakeData) {
  // STEP 1 — Build the prompt
  // We tell the AI exactly who it is, what to do, and what format to respond in.
  // Using a "system" message for role/instructions + a "user" message for data
  // is standard practice — it gives the model clear context separation.
  const systemPrompt = `
You are MediTriage, an expert medical triage assistant AI.
Your job is to analyze patient intake information and return a structured JSON response.

You MUST respond with ONLY valid JSON — no extra text, no markdown, no code fences.
The JSON must follow this exact schema:

{
  "urgency": "<one of: Emergency | Urgent | Semi-Urgent | Non-Urgent>",
  "urgencyReason": "<1-2 sentence plain-English explanation of why this urgency level was chosen>",
  "doctorSummary": "<3-5 sentence clinical summary written for the receiving physician>",
  "extractedData": {
    "primaryComplaint": "<main symptom or reason for visit>",
    "symptomDurationDays": <integer or null if unknown>,
    "painScale": <integer 1-10 or null if not mentioned>,
    "flaggedSymptoms": ["<any red-flag symptoms like chest pain, difficulty breathing, etc.>"],
    "relevantHistory": ["<relevant past conditions, medications, or allergies mentioned>"]
  }
}

Urgency level definitions:
- Emergency:    Life-threatening. Needs 911 or ER immediately. (e.g. chest pain, stroke signs, severe bleeding)
- Urgent:       Serious but not immediately life-threatening. Needs care within hours. (e.g. high fever, broken bone)
- Semi-Urgent:  Needs attention soon but can wait 1-2 days. (e.g. ear infection, moderate pain)
- Non-Urgent:   Routine care. Can be scheduled normally. (e.g. mild cold, prescription refill)
`.trim();

  // STEP 2 — Format the patient data into a readable "user" message
  // We convert the intake form object into a clear text block so the AI
  // can read each field like a doctor reading a chart.
  // Arrays (symptoms, existingConditions, etc.) are joined into comma-separated
  // strings so the AI receives readable text instead of "[object Object]".
  const symptomList = Array.isArray(intakeData.symptoms)
    ? intakeData.symptoms.join(", ")
    : intakeData.symptoms || "Not provided";

  const conditionsList = Array.isArray(intakeData.existingConditions)
    ? intakeData.existingConditions.join(", ")
    : intakeData.existingConditions || "None reported";

  const medicationsList = Array.isArray(intakeData.currentMedications)
    ? intakeData.currentMedications.join(", ")
    : intakeData.currentMedications || "None reported";

  const allergiesList = Array.isArray(intakeData.allergies)
    ? intakeData.allergies.join(", ")
    : intakeData.allergies || "None reported";

  // Calculate age from date of birth
  let ageString = "Not provided";
  if (intakeData.dateOfBirth) {
    const dob = new Date(intakeData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    ageString = `${age} years old (DOB: ${intakeData.dateOfBirth})`;
  }

  const userMessage = `
Please triage the following patient:

Name: ${intakeData.firstName} ${intakeData.lastName}
Patient Age: ${ageString}
Chief Complaint: ${intakeData.chiefComplaint || "Not provided"}
Symptoms: ${symptomList}
Symptom Duration: ${intakeData.symptomDuration || "Not provided"}
Pain Level (1-10): ${intakeData.painLevel || "Not provided"}
Existing Conditions: ${conditionsList}
Current Medications: ${medicationsList}
Allergies: ${allergiesList}
`.trim();

  // STEP 3 — Call the Groq API
  // This is an async call — it sends our prompt to Llama 3 and waits for a reply.
  // "await" pauses execution here until Groq responds (usually < 2 seconds).
  const chatCompletion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct", // Llama 3 70B — best quality available on Groq
    temperature: 0.2,         // Low temperature = more consistent, clinical responses
                              // (0 = deterministic, 1 = creative — we want reliable)
    max_tokens: 1024,         // Plenty of room for our JSON response
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage  },
    ],
  });

  // STEP 4 — Extract the text content from Groq's response
  // Groq returns a nested object. The actual reply text lives here:
  const rawText = chatCompletion.choices[0]?.message?.content ?? "";

  // STEP 5 — Parse the JSON
  // The AI was instructed to return only JSON. We parse it so we get a real
  // JavaScript object (not just a string) to save into MongoDB.
  // If parsing fails, we throw a descriptive error so it's easy to debug.
  let parsed;
  try {
    const cleanedText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    parsed = JSON.parse(cleanedText);
  } catch (err) {
    // This can happen if the model adds unexpected text around the JSON.
    // The low temperature and strict prompt should prevent this, but just in case:
    throw new Error(
      `Triage agent returned non-JSON response.\nRaw text: ${rawText}\nParse error: ${err.message}`
    );
  }

  // STEP 6 — Return the structured result to whoever called this function
  // (That will be intake.js, which saves this into MongoDB)
  return {
    urgency:       parsed.urgency,
    urgencyReason: parsed.urgencyReason,
    doctorSummary: parsed.doctorSummary,
    extractedData: parsed.extractedData,
  };
}