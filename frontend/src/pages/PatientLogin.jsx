// src/pages/PatientLogin.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PatientLogin() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Skip login if already authenticated
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/portal');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/auth/patient-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/portal');
    } catch (err) {
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>

        <div className="border-t border-gray-100 mt-5 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Are you a doctor?{' '}
            <Link to="/login" className="text-gray-500 hover:text-blue-600 hover:underline">
              Doctor Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
