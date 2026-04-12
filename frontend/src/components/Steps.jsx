// src/components/Steps.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Fatigue', 'Dizziness',
  'Sore throat', 'Muscle aches', 'Loss of appetite', 'Chills',
];

// Shared Tailwind class strings
const inputCls  = 'border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const labelCls  = 'block text-sm font-medium text-gray-700 mb-1';
const fieldCls  = 'mb-4';
const btnNext   = 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg cursor-pointer';
const btnBack   = 'border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg cursor-pointer';
const navRowCls = 'flex justify-between mt-6';


// ─────────────────────────────────────────────────────────
// STEP 1 — Personal information
// ─────────────────────────────────────────────────────────
export function StepOne({ data, update, onNext }) {

  const handleNext = () => {
    if (!data.firstName || !data.lastName || !data.email) {
      alert('Please fill in your first name, last name, and email');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Personal information</h2>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className={labelCls}>First name *</label>
          <input
            className={inputCls}
            value={data.firstName}
            onChange={e => update({ firstName: e.target.value })}
            placeholder="Jane"
          />
        </div>
        <div className="flex-1">
          <label className={labelCls}>Last name *</label>
          <input
            className={inputCls}
            value={data.lastName}
            onChange={e => update({ lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className={fieldCls}>
        <label className={labelCls}>Date of birth *</label>
        <input
          type="date"
          className={inputCls}
          value={data.dateOfBirth}
          onChange={e => update({ dateOfBirth: e.target.value })}
        />
      </div>

      <div className={fieldCls}>
        <label className={labelCls}>Email *</label>
        <input
          type="email"
          className={inputCls}
          value={data.email}
          onChange={e => update({ email: e.target.value })}
          placeholder="jane@example.com"
        />
      </div>

      <div className={fieldCls}>
        <label className={labelCls}>Phone</label>
        <input
          className={inputCls}
          value={data.phone}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
            let formatted = digits;
            if (digits.length > 6) {
              formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            } else if (digits.length > 3) {
              formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else if (digits.length > 0) {
              formatted = `(${digits}`;
            }
            update({ phone: formatted });
          }}
          placeholder="(617) 555-0100"
        />
      </div>

      <div className="flex justify-end mt-6">
        <button className={btnNext} onClick={handleNext}>Next →</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// STEP 2 — Chief complaint
// ─────────────────────────────────────────────────────────
export function StepTwo({ data, update, onNext, onBack }) {

  const handleNext = () => {
    if (!data.chiefComplaint.trim()) {
      alert('Please describe your main concern');
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">What brings you in today?</h2>

      <div className={fieldCls}>
        <label className={labelCls}>Main concern *</label>
        <textarea
          className={`${inputCls} h-28 resize-y`}
          value={data.chiefComplaint}
          onChange={e => update({ chiefComplaint: e.target.value })}
          placeholder="Describe your main symptom or reason for visiting..."
        />
      </div>

      <div className={navRowCls}>
        <button className={btnBack} onClick={onBack}>← Back</button>
        <button className={btnNext} onClick={handleNext}>Next →</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// STEP 3 — Symptoms
// ─────────────────────────────────────────────────────────
export function StepThree({ data, update, onNext, onBack }) {

  const toggleSymptom = (symptom) => {
    const alreadySelected = data.symptoms.includes(symptom);
    update({
      symptoms: alreadySelected
        ? data.symptoms.filter(s => s !== symptom)
        : [...data.symptoms, symptom],
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Symptoms</h2>

      <div className={fieldCls}>
        <label className={labelCls}>Select all that apply</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_SYMPTOMS.map(sym => {
            const selected = data.symptoms.includes(sym);
            return (
              <button
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`px-3.5 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
                  selected
                    ? 'bg-blue-600 border-blue-600 text-white font-medium'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      <div className={fieldCls}>
        <label className={labelCls}>How long have you had these symptoms?</label>
        <input
          className={inputCls}
          value={data.symptomDuration}
          onChange={e => update({ symptomDuration: e.target.value })}
          placeholder="e.g. 3 days, 1 week, 2 months"
        />
      </div>

      <div className={fieldCls}>
        <label className={labelCls}>
          Pain / discomfort level:&nbsp;
          <span className="font-semibold text-gray-900">{data.painLevel} / 10</span>
        </label>
        <input
          type="range" min={1} max={10} step={1}
          className="w-full mt-2 accent-blue-600"
          value={data.painLevel}
          onChange={e => update({ painLevel: Number(e.target.value) })}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 — mild</span>
          <span>10 — severe</span>
        </div>
      </div>

      <div className={navRowCls}>
        <button className={btnBack} onClick={onBack}>← Back</button>
        <button className={btnNext} onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// STEP 4 — Medical history & submit
// ─────────────────────────────────────────────────────────

function TagInput({ label, value, onChange, placeholder }) {
  const [raw, setRaw] = useState(value.join(', '));

  useEffect(() => {
    setRaw(value.join(', '));
  }, [value]);

  return (
    <div className={fieldCls}>
      <label className={labelCls}>{label}</label>
      <input
        className={inputCls}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={() => onChange(raw.split(',').map(s => s.trim()).filter(Boolean))}
        placeholder={placeholder}
      />
      <p className="text-xs text-gray-400 mt-1">Separate multiple entries with commas</p>
    </div>
  );
}

export function StepFour({ data, update, onBack, onSubmit, isSubmitting }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Medical history</h2>

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

      <div className={navRowCls}>
        <button className={btnBack} onClick={onBack}>← Back</button>
        <button
          className={`${btnNext} ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={onSubmit}
          disabled={isSubmitting}
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
  const navigate = useNavigate();
  return (
    <div className="text-center py-6">

      {/* Green checkmark circle */}
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl text-green-600">
        ✓
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">Intake submitted!</h2>
      <p className="text-sm text-gray-500 mb-6">
        Thank you, <strong className="text-gray-700">{formData.firstName}</strong>. Your intake has been received.
        A member of our team will review your information before your appointment.
      </p>

      {/* Summary card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left text-sm text-gray-700 space-y-2">
        <p><strong className="text-gray-900">Main concern:</strong> {formData.chiefComplaint}</p>
        <p><strong className="text-gray-900">Symptoms:</strong> {formData.symptoms.length > 0 ? formData.symptoms.join(', ') : 'None selected'}</p>
        <p><strong className="text-gray-900">Pain level:</strong> {formData.painLevel} / 10</p>
        <p><strong className="text-gray-900">Duration:</strong> {formData.symptomDuration || 'Not specified'}</p>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mt-6 cursor-pointer"
      >
        View Dashboard →
      </button>
    </div>
  );
}
