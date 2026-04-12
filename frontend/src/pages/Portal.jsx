// src/pages/Portal.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const URGENCY_BADGE = {
  'Emergency':   'bg-red-100 text-red-800 border border-red-300',
  'Urgent':      'bg-orange-100 text-orange-800 border border-orange-300',
  'Semi-Urgent': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'Non-Urgent':  'bg-green-100 text-green-800 border border-green-300',
};

const STATUS_BADGE = {
  'pending':         'bg-gray-100 text-gray-600 border border-gray-300',
  'seen':            'bg-green-100 text-green-700 border border-green-300',
  'needs-follow-up': 'bg-blue-100 text-blue-700 border border-blue-300',
};

const STATUS_LABEL = {
  'pending':         'Pending',
  'seen':            'Seen',
  'needs-follow-up': 'Needs follow-up',
};

const URGENCY_LEFT_BORDER = {
  'Emergency':   'border-l-4 border-red-500',
  'Urgent':      'border-l-4 border-orange-400',
  'Semi-Urgent': 'border-l-4 border-yellow-400',
  'Non-Urgent':  'border-l-4 border-green-500',
};

export default function Portal() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/patient-login');
      return;
    }

    fetch(`${API}/api/intake`)
      .then(res => res.json())
      .then(result => {
        const mine = (result.data || []).filter(
          s => s.email?.toLowerCase() === user?.email?.toLowerCase()
        );
        setSubmissions(mine);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load submissions:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/patient-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 no-underline">
            <span className="text-white text-xl">✚</span>
            <span className="text-white text-lg font-bold tracking-wide">MediTriage</span>
          </a>
          <a
            href="/"
            className="text-blue-200 hover:text-white text-sm ml-6"
          >
            ← New Intake
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm font-medium">Patient Portal</span>
          <button
            onClick={handleLogout}
            className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Welcome message ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {!loading && submissions.length > 0 ? 'Welcome back' : 'Welcome'}, {user?.firstName}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your intake submission history</p>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading your submissions...</p>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No submissions yet. Submit your first intake form.</p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Start Intake Form
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {submissions.map(s => {
              const borderCls   = URGENCY_LEFT_BORDER[s.urgency]  ?? 'border-l-4 border-gray-300';
              const badgeCls    = URGENCY_BADGE[s.urgency]        ?? 'bg-gray-100 text-gray-700 border border-gray-300';
              const statusKey   = s.status || 'pending';
              const statusCls   = STATUS_BADGE[statusKey]         ?? STATUS_BADGE['pending'];
              const statusLabel = STATUS_LABEL[statusKey]         ?? 'Pending';
              const submitted = s.createdAt
                ? new Date(s.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })
                : 'Unknown date';

              return (
                <div
                  key={s._id}
                  className={`bg-white rounded-xl shadow-sm ${borderCls} px-5 py-4`}
                >
                  {/* Date + urgency badge + status badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Submitted {submitted}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeCls}`}>
                        {s.urgency ?? 'Pending review'}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusCls}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Chief complaint */}
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {s.chiefComplaint || 'No complaint provided'}
                  </p>

                  {/* Urgency reason */}
                  {s.urgencyReason && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong className="text-gray-800">Assessment:</strong> {s.urgencyReason}
                    </p>
                  )}

                  {/* Doctor summary */}
                  {s.doctorSummary && (
                    <p className="text-sm text-gray-600">
                      <strong className="text-gray-800">Summary:</strong> {s.doctorSummary}
                    </p>
                  )}
                </div>
              );
            })}

            {/* ── Submit another intake ── */}
            <div className="pt-2 text-center">
              <button
                onClick={() => { window.location.href = '/'; }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline cursor-pointer"
              >
                + Submit a new intake form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
