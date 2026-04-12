// src/components/Steps.jsx
import { useState, useEffect } from 'react';
// Contains all 4 form steps + the Confirmation screen
//
// CONCEPT: Props
// ──────────────
// Props (short for "properties") are how a parent component passes
// data and functions DOWN to a child component.
// Think of props like arguments to a function:
//   function StepOne({ data, update, onNext })
//   data   → the current form values (read only)
//   update → a function to change form values
//   onNext → a function to go to the next step
// The child component CANNOT directly modify the parent's state.
// It can only call update() and ask the parent to change it.
// This is called "one-way data flow" and is a core React principle.

// Shared styles used across all step components
// Defined once here so we don't repeat ourselves (DRY principle)
const styles = {
  stepTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#111827' },
  field:     { marginBottom: 16 },
  label:     { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input:     {
    width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 14,
    border: '1px solid #d1d5db', boxSizing: 'border-box', outline: 'none',
    fontFamily: 'inherit',
  },
  row:        { display: 'flex', gap: 12 },
  navRow:     { display: 'flex', justifyContent: 'space-between', marginTop: 24 },
  btnPrimary: {
    background: '#2563eb', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: 6, fontSize: 14,
    cursor: 'pointer', fontWeight: 500,
  },
  btnSecondary: {
    background: '#fff', color: '#374151', border: '1px solid #d1d5db',
    padding: '10px 24px', borderRadius: 6, fontSize: 14, cursor: 'pointer',
  },
};


// ─────────────────────────────────────────────────────────
// STEP 1 — Personal information
// ─────────────────────────────────────────────────────────
export function StepOne({ data, update, onNext }) {

  const handleNext = () => {
    // Validate before allowing the user to proceed
    if (!data.firstName || !data.lastName || !data.email) {
      alert('Please fill in your first name, last name, and email');
      return; // stop here — don't call onNext()
    }
    onNext(); // tell App.jsx to move to step 2
  };

  return (
    <div>
      <h2 style={styles.stepTitle}>Personal information</h2>

      {/* Two fields side by side using flexbox */}
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>First name *</label>
          {/* onChange fires every time the user types a character
              e.target.value is the current value of the input field
              update() merges { firstName: '...' } into the parent's formData */}
          <input
            style={styles.input}
            value={data.firstName}
            onChange={e => update({ firstName: e.target.value })}
            placeholder="Jane"
          />
        </div>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Last name *</label>
          <input
            style={styles.input}
            value={data.lastName}
            onChange={e => update({ lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Date of birth *</label>
        <input
          type="date"
          style={styles.input}
          value={data.dateOfBirth}
          onChange={e => update({ dateOfBirth: e.target.value })}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Email *</label>
        <input
          type="email"
          style={styles.input}
          value={data.email}
          onChange={e => update({ email: e.target.value })}
          placeholder="jane@example.com"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Phone</label>
        <input
          style={styles.input}
          value={data.phone}
          onChange={e => update({ phone: e.target.value })}
          placeholder="(617) 555-0100"
        />
      </div>

      {/* Only a Next button on step 1 — no Back button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button style={styles.btnPrimary} onClick={handleNext}>Next →</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// STEP 2 — Chief complaint
// ─────────────────────────────────────────────────────────
export function StepTwo({ data, update, onNext, onBack }) {

  const handleNext = () => {
    if (!data.chiefComplaint.trim()) { // .trim() removes whitespace
      alert('Please describe your main concern');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 style={styles.stepTitle}>What brings you in today?</h2>

      <div style={styles.field}>
        <label style={styles.label}>Main concern *</label>
        {/* textarea for longer text input */}
        <textarea
          style={{ ...styles.input, height: 120, resize: 'vertical' }}
          value={data.chiefComplaint}
          onChange={e => update({ chiefComplaint: e.target.value })}
          placeholder="Describe your main symptom or reason for visiting..."
        />
      </div>

      <div style={styles.navRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={styles.btnPrimary}   onClick={handleNext}>Next →</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// STEP 3 — Symptoms
// ─────────────────────────────────────────────────────────
// A list of common symptoms the patient can toggle on/off
const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Fatigue', 'Dizziness',
  'Sore throat', 'Muscle aches', 'Loss of appetite', 'Chills',
];

export function StepThree({ data, update, onNext, onBack }) {

  // Toggle a symptom in/out of the symptoms array
  const toggleSymptom = (symptom) => {
    const alreadySelected = data.symptoms.includes(symptom);
    update({
      symptoms: alreadySelected
        ? data.symptoms.filter(s => s !== symptom) // remove it
        : [...data.symptoms, symptom],              // add it (spread keeps existing items)
    });
  };

  return (
    <div>
      <h2 style={styles.stepTitle}>Symptoms</h2>

      <div style={styles.field}>
        <label style={styles.label}>Select all that apply</label>
        {/* Symptom toggle buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {COMMON_SYMPTOMS.map(sym => {
            const selected = data.symptoms.includes(sym);
            return (
              <button
                key={sym}        // key helps React track list items efficiently
                onClick={() => toggleSymptom(sym)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13,
                  cursor: 'pointer', border: '1px solid',
                  // Change appearance based on whether it's selected
                  background:   selected ? '#2563eb' : '#fff',
                  borderColor:  selected ? '#2563eb' : '#d1d5db',
                  color:        selected ? '#fff'    : '#374151',
                  fontWeight:   selected ? 500       : 400,
                }}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>How long have you had these symptoms?</label>
        <input
          style={styles.input}
          value={data.symptomDuration}
          onChange={e => update({ symptomDuration: e.target.value })}
          placeholder="e.g. 3 days, 1 week, 2 months"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          Pain / discomfort level:&nbsp;
          <strong>{data.painLevel} / 10</strong>
        </label>
        {/* Range slider — value updates live as the user drags */}
        <input
          type="range" min={1} max={10} step={1}
          style={{ width: '100%', marginTop: 8 }}
          value={data.painLevel}
          onChange={e => update({ painLevel: Number(e.target.value) })}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
          <span>1 — mild</span>
          <span>10 — severe</span>
        </div>
      </div>

      <div style={styles.navRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={styles.btnPrimary}   onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// STEP 4 — Medical history & submit
// ─────────────────────────────────────────────────────────

// TagInput — a reusable component for comma-separated list inputs
// The user types "Diabetes, Asthma" and we split it into ["Diabetes", "Asthma"]
// CONCEPT: Reusable components
// Instead of repeating the same input 3 times, we define it once
// and reuse it with different props — same idea as a function
function TagInput({ label, value, onChange, placeholder }) {
  // Store the raw string locally while the user is typing.
  // Splitting on every keystroke caused the cursor to jump when typing spaces.
  const [raw, setRaw] = useState(value.join(', '));

  // Sync inward when the parent resets or pre-fills the value array.
  useEffect(() => {
    setRaw(value.join(', '));
  }, [value]);

  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        // Only convert to array and notify the parent when the user leaves the field.
        onBlur={() => onChange(raw.split(',').map(s => s.trim()).filter(Boolean))}
        placeholder={placeholder}
      />
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
        Separate multiple entries with commas
      </p>
    </div>
  );
}

export function StepFour({ data, update, onBack, onSubmit, isSubmitting }) {
  return (
    <div>
      <h2 style={styles.stepTitle}>Medical history</h2>

      <TagInput
        label="Existing conditions"
        value={data.existingConditions}
        onChange={val => update({ existingConditions: val })}
        placeholder="e.g. Diabetes, Hypertension, Asthma"
      />
      <TagInput
        label="Allergies"
        value={data.allergies}
        onChange={val => update({ allergies: val })}
        placeholder="e.g. Penicillin, Peanuts, Latex"
      />
      <TagInput
        label="Current medications"
        value={data.currentMedications}
        onChange={val => update({ currentMedications: val })}
        placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
      />

      <div style={styles.navRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button
          style={{ ...styles.btnPrimary, opacity: isSubmitting ? 0.6 : 1 }}
          onClick={onSubmit}
          disabled={isSubmitting} // prevents double-clicking
        >
          {isSubmitting ? 'Submitting...' : 'Submit intake'}
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// CONFIRMATION — shown after successful submission
// ─────────────────────────────────────────────────────────
export function Confirmation({ formData }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>

      {/* Checkmark circle */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#dcfce7', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem', fontSize: 28,
      }}>
        ✓
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
        Intake submitted!
      </h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        Thank you, <strong>{formData.firstName}</strong>. Your intake has been received.
        A member of our team will review your information before your appointment.
      </p>

      {/* Summary card */}
      <div style={{
        background: '#f9fafb', border: '1px solid #e5e7eb',
        borderRadius: 8, padding: '1rem 1.25rem',
        textAlign: 'left', fontSize: 14, color: '#374151',
      }}>
        <p style={{ margin: '0 0 8px' }}>
          <strong>Main concern:</strong> {formData.chiefComplaint}
        </p>
        <p style={{ margin: '0 0 8px' }}>
          <strong>Symptoms:</strong> {formData.symptoms.length > 0 ? formData.symptoms.join(', ') : 'None selected'}
        </p>
        <p style={{ margin: '0 0 8px' }}>
          <strong>Pain level:</strong> {formData.painLevel} / 10
        </p>
        <p style={{ margin: 0 }}>
          <strong>Duration:</strong> {formData.symptomDuration || 'Not specified'}
        </p>
      </div>
    </div>
  );
}