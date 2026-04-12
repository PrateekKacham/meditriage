// src/App.jsx
import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { StepOne, StepTwo, StepThree, StepFour, Confirmation } from './components/Steps';
import { submitIntake } from './api/intake';
import Dashboard from './pages/Dashboard';
import Login     from './pages/Login';

const initialForm = {
  firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '',
  chiefComplaint: '',
  symptoms: [], symptomDuration: '', painLevel: 5,
  existingConditions: [], allergies: [], currentMedications: [],
};

const STEP_LABELS = ['Personal', 'Complaint', 'Symptoms', 'History'];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData]       = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState(null);
  const [submitted, setSubmitted]     = useState(false);

  const updateForm = (fields) => setFormData(prev => ({ ...prev, ...fields }));
  const nextStep   = () => setCurrentStep(s => s + 1);
  const prevStep   = () => setCurrentStep(s => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await submitIntake(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const intakeForm = submitted ? (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <span className="text-4xl text-blue-600">✚</span>
          <h1 className="text-2xl font-bold text-blue-600 mt-2">MediTriage</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8">
          <Confirmation formData={formData} />
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto py-10 px-4">

        {/* ── Branded header ── */}
        <div className="text-center mb-8">
          <span className="text-4xl text-blue-600">✚</span>
          <h1 className="text-2xl font-bold text-blue-600 mt-2">MediTriage</h1>
          <p className="text-sm text-gray-500 mt-1">Patient Intake Form</p>
        </div>

        {/* ── White card ── */}
        <div className="bg-white rounded-2xl shadow-md p-8">

          <p className="text-sm text-gray-500 mb-4">
            Step {currentStep} of 4 — please fill in all required fields
          </p>

          {/* ── Progress bar ── */}
          <div className="flex gap-1.5 mb-3">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                  n <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* ── Step labels ── */}
          <div className="flex justify-between text-xs mb-7">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={i + 1 === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400'}
              >
                {label}
              </span>
            ))}
          </div>

          {/* ── Active step ── */}
          {currentStep === 1 && <StepOne   data={formData} update={updateForm} onNext={nextStep} />}
          {currentStep === 2 && <StepTwo   data={formData} update={updateForm} onNext={nextStep} onBack={prevStep} />}
          {currentStep === 3 && <StepThree data={formData} update={updateForm} onNext={nextStep} onBack={prevStep} />}
          {currentStep === 4 && (
            <StepFour
              data={formData}
              update={updateForm}
              onBack={prevStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {/* ── Error banner ── */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              Something went wrong: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/"          element={intakeForm} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login"     element={<Login />} />
    </Routes>
  );
}
