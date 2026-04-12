// src/pages/Login.jsx
import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) window.location.href = '/dashboard';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
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
        <p className="text-sm text-gray-500 mt-1">Staff Portal</p>
      </div>

      {/* ── Login card ── */}
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Doctor Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="doctor@meditriage.com"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? '👁‍🗨' : '👁'}
              </button>
            </div>
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
