// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Password strength helpers ─────────────────────────────────────────────────
function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

// Colors for each of the 4 segments at each strength level
// segment index 0–3, strength 0–4
const SEGMENT_COLORS = [
  // strength 0 — no segments filled
  ['bg-gray-200', 'bg-gray-200', 'bg-gray-200', 'bg-gray-200'],
  // strength 1 — Weak
  ['bg-red-500',  'bg-gray-200', 'bg-gray-200', 'bg-gray-200'],
  // strength 2 — Fair
  ['bg-orange-400', 'bg-orange-400', 'bg-gray-200', 'bg-gray-200'],
  // strength 3 — Good
  ['bg-yellow-400', 'bg-yellow-400', 'bg-yellow-400', 'bg-gray-200'],
  // strength 4 — Strong
  ['bg-green-500', 'bg-green-500', 'bg-green-500', 'bg-green-500'],
];

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-orange-400', 'text-yellow-500', 'text-green-600'];

// ── Validation ────────────────────────────────────────────────────────────────
function validate(email, password, confirmPassword) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Please enter a valid email address';
  if (password.length < 8)
    return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password))
    return 'Password must contain at least one number';
  if (password !== confirmPassword)
    return 'Passwords do not match';
  return null;
}

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10';

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName]         = useState('');
  const [lastName, setLastName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                 = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  useEffect(() => {
    document.title = 'Register — MediTriage';
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/portal');
  }, []);

  const strength    = calcStrength(password);
  const segColors   = SEGMENT_COLORS[strength];
  const mismatch    = confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(email, password, confirmPassword);
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Registration failed'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4">

      {/* ── Branding ── */}
      <div className="text-center mb-8">
        <span className="text-4xl text-blue-600">✚</span>
        <h1 className="text-2xl font-bold text-blue-600 mt-2">MediTriage</h1>
        <p className="text-sm text-gray-500 mt-1">Patient Portal</p>
      </div>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Patient Account</h2>

        <form onSubmit={handleSubmit}>

          {/* First + last name */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text" required
                value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Jane"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text" required
                value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Doe"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Password + strength bar */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {/* 4-segment strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {segColors.map((cls, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${cls}`} />
                  ))}
                </div>
                <p className={`text-xs mt-1 font-medium ${STRENGTH_TEXT[strength]}`}>
                  {STRENGTH_LABEL[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'} required
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`${mismatch
                  ? 'border border-red-400 focus:ring-red-400'
                  : 'border border-gray-300 focus:ring-blue-500'
                } rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 text-sm pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {mismatch && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/patient-login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
