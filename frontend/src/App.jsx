// src/App.jsx — the brain of the entire intake form
//
// CONCEPT: Lifting State Up
// ──────────────────────────
// Each step component (StepOne, StepTwo etc.) needs to READ and WRITE
// the same form data. If each step stored its own data, they couldn't
// share it — StepFour wouldn't know what the patient typed in StepOne.
//
// The solution: store ALL form data here in App.jsx (the parent),
// and pass it DOWN to each step as props. This is called "lifting state up"
// and is one of the most important patterns in React.
//
// Data flow:
//   App.jsx (owns formData)
//     ↓ passes data + update as props
//   StepOne / StepTwo / StepThree / StepFour
//     ↑ calls update({ fieldName: value }) to change parent's state

import { useState } from 'react';
import { StepOne, StepTwo, StepThree, StepFour, Confirmation } from './components/Steps';
import { submitIntake } from './api/intake';

// The initial shape of ALL form data — one object covering all 4 steps
// Every field starts empty or at a sensible default
const initialForm = {
  // Step 1 — personal info
  firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '',
  // Step 2 — chief complaint
  chiefComplaint: '',
  // Step 3 — symptoms
  symptoms: [], symptomDuration: '', painLevel: 5,
  // Step 4 — medical history
  existingConditions: [], allergies: [], currentMedications: [],
};

export default function App() {
  // currentStep: which step (1–4) is currently visible
  const [currentStep, setCurrentStep] = useState(1);

  // formData: the single source of truth for everything the patient has typed
  const [formData, setFormData] = useState(initialForm);

  // isSubmitting: true while waiting for the backend to respond
  // Used to disable the submit button and prevent double-clicks
  const [isSubmitting, setIsSubmitting] = useState(false);

  // error: stores any error message from the backend to show the user
  const [error, setError] = useState(null);

  // submitted: flips to true after successful submission → shows Confirmation
  const [submitted, setSubmitted] = useState(false);

  // updateForm — merges new fields into formData without losing existing data
  // The spread operator "..." copies all existing fields first,
  // then the new fields overwrite only the ones that changed
  // Example: updateForm({ firstName: 'Jane' }) keeps all other fields intact
  const updateForm = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep(s => s + 1); // go forward
  const prevStep = () => setCurrentStep(s => s - 1); // go back

  // handleSubmit — called when patient clicks "Submit intake" on Step 4
  const handleSubmit = async () => {
    setIsSubmitting(true); // show "Submitting..." on the button
    setError(null);        // clear any previous error

    try {
      // Send all form data to the backend via our api/intake.js helper
      await submitIntake(formData);
      setSubmitted(true); // show the Confirmation screen

    } catch (err) {
      // If the backend returned an error, show it to the user
      setError(err.message);

    } finally {
      // finally runs whether the request succeeded or failed
      setIsSubmitting(false); // always re-enable the button
    }
  };

  // If submitted successfully, show Confirmation screen instead of the form
  if (submitted) {
    return <Confirmation formData={formData} />;
  }

  return (
    <div style={{
      maxWidth: 560,
      margin: '2rem auto',
      padding: '0 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* ── Header ── */}
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#111827' }}>
        Patient Intake Form
      </h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
        Step {currentStep} of 4 — please fill in all required fields
      </p>

      {/* ── Progress bar ── */}
      {/* 4 segments, filled (blue) up to currentStep, gray after */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            style={{
              flex: 1, height: 4, borderRadius: 4,
              background: n <= currentStep ? '#2563eb' : '#e5e7eb',
              transition: 'background 0.3s', // smooth colour transition
            }}
          />
        ))}
      </div>

      {/* ── Step labels ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 28 }}>
        <span style={{ color: currentStep === 1 ? '#2563eb' : '#9ca3af' }}>Personal</span>
        <span style={{ color: currentStep === 2 ? '#2563eb' : '#9ca3af' }}>Complaint</span>
        <span style={{ color: currentStep === 3 ? '#2563eb' : '#9ca3af' }}>Symptoms</span>
        <span style={{ color: currentStep === 4 ? '#2563eb' : '#9ca3af' }}>History</span>
      </div>

      {/* ── Render the correct step based on currentStep ── */}
      {/* Each step gets the full formData and the updateForm function */}
      {currentStep === 1 && (
        <StepOne data={formData} update={updateForm} onNext={nextStep} />
      )}
      {currentStep === 2 && (
        <StepTwo data={formData} update={updateForm} onNext={nextStep} onBack={prevStep} />
      )}
      {currentStep === 3 && (
        <StepThree data={formData} update={updateForm} onNext={nextStep} onBack={prevStep} />
      )}
      {currentStep === 4 && (
        <StepFour
          data={formData}
          update={updateForm}
          onBack={prevStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── Error message ── */}
      {/* Only shown if the backend returned an error */}
      {error && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 6, color: '#dc2626', fontSize: 14,
        }}>
          Something went wrong: {error}
        </div>
      )}
    </div>
  );
}