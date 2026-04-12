// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { StepOne, StepTwo, StepThree, StepFour, Confirmation } from './components/Steps';
import { submitIntake } from './api/intake';
import Dashboard   from './pages/Dashboard';
import Login       from './pages/Login';
import Register    from './pages/Register';
import PatientLogin from './pages/PatientLogin';
import Portal      from './pages/Portal';

// ── Shared constants ─────────────────────────────────────────────────────────

const STEP_LABELS = ['Personal', 'Complaint', 'Symptoms', 'History'];

const blankForm = {
  firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '',
  chiefComplaint: '',
  symptoms: [], symptomDuration: '', painLevel: 5,
  existingConditions: [], allergies: [], currentMedications: [],
};

// ── IntakeForm ────────────────────────────────────────────────────────────────
// Owns all intake form state. Lives at route "/".
// ─────────────────────────────────────────────────────────────────────────────
function IntakeForm() {
  const navigate = useNavigate();

  // Read stored patient to pre-fill personal fields
  const storedUser = localStorage.getItem('user');
  const savedUser  = storedUser ? JSON.parse(storedUser) : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    ...blankForm,
    firstName: savedUser?.firstName || '',
    lastName:  savedUser?.lastName  || '',
    email:     savedUser?.email     || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]   = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Redirect logged-in patients to their portal
  useEffect(() => {
    const token = localStorage.getItem('token');
    const su    = localStorage.getItem('user');
    const u     = su ? JSON.parse(su) : null;
    if (token && u?.role === 'patient') {
      navigate('/portal');
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // ── Navbar — shared by both the form and confirmation screens ───────────────
  const token = localStorage.getItem('token');
  const role  = savedUser?.role;

  const navbar = (
    <nav className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-white text-xl">✚</span>
        <span className="text-white text-lg font-bold tracking-wide">MediTriage</span>
      </div>
      <div className="flex items-center gap-3">
        {!token ? (
          <>
            <Link
              to="/patient-login"
              className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
            >
              Patient Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded-lg transition-colors"
            >
              Register
            </Link>
          </>
        ) : role === 'patient' ? (
          <>
            <Link
              to="/portal"
              className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
            >
              My Portal
            </Link>
            <button
              onClick={handleLogout}
              className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {navbar}
        <div className="max-w-xl mx-auto py-10 px-4">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <Confirmation formData={formData} />
          </div>
        </div>
      </div>
    );
  }

  // ── Intake form ───────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      {navbar}
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

        {/* ── Signed-in note ── */}
        {savedUser && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Signed in as {savedUser.email} ·{' '}
            <button
              onClick={handleLogout}
              className="hover:text-gray-600 underline cursor-pointer"
            >
              Not you? Log out
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
// Root component — just owns the route table.
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<IntakeForm />} />
      <Route path="/dashboard"  element={<Dashboard />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/patient-login" element={<PatientLogin />} />
      <Route path="/portal"     element={<Portal />} />
    </Routes>
  );
}
