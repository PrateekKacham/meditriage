// src/pages/Profile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profile() {
  const navigate = useNavigate();

  let user = null;
  try {
    const stored = localStorage.getItem('user');
    user = stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
  }

  if (!user) {
    window.location.href = '/patient-login';
    return null;
  }

  const [firstName,   setFirstName]   = useState(user.firstName   || '');
  const [lastName,    setLastName]    = useState(user.lastName     || '');
  const [phone,       setPhone]       = useState(user.phone        || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth  || '');
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, phone, dateOfBirth }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Update failed');
        return;
      }

      // Update localStorage so navbar reflects the new name immediately
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Profile updated successfully!');
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2">
            <span className="text-white text-xl">✚</span>
            <span className="text-white text-lg font-bold tracking-wide">MediTriage</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = '/portal'; }}
            className="text-blue-200 hover:text-white text-sm cursor-pointer bg-transparent border-none"
          >
            ← Back to Portal
          </button>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-10">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {initials}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit}>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(617) 555-0100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                {success}
              </p>
            )}

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
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
