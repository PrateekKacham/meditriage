// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Complete Tailwind class strings — must be full strings so Tailwind includes them
const URGENCY_LEFT_BORDER = {
  'Emergency':   'border-l-4 border-red-500',
  'Urgent':      'border-l-4 border-orange-400',
  'Semi-Urgent': 'border-l-4 border-yellow-400',
  'Non-Urgent':  'border-l-4 border-green-500',
};

const URGENCY_BADGE = {
  'Emergency':   'bg-red-100 text-red-800 border border-red-300',
  'Urgent':      'bg-orange-100 text-orange-800 border border-orange-300',
  'Semi-Urgent': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'Non-Urgent':  'bg-green-100 text-green-800 border border-green-300',
};

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
      <span>✓ {message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-base leading-none">×</button>
    </div>
  );
}

function joinOrFallback(arr, fallback = 'None reported') {
  return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : fallback;
}

function DetailRow({ label, value }) {
  return (
    <p className="text-sm text-gray-700 mb-2">
      <strong className="text-gray-900">{label}:</strong> {value}
    </p>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard — MediTriage';
  }, []);

  // Guard: redirect to login if no token
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, []);

  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId]     = useState(null);
  const [toast, setToast]               = useState('');
  const showToast = (msg) => setToast(msg);
  const [retriagingId, setRetriagingId] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [sortBy, setSortBy]               = useState('newest');
  const [currentPage, setCurrentPage]     = useState(1);
  const PATIENTS_PER_PAGE = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, urgencyFilter, statusFilter, sortBy]);

  useEffect(() => {
    fetch(`${API}/api/intake`)
      .then(res => res.json())
      .then(result => {
        setPatients(result.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load patients:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-white text-xl">✚</span>
            <span className="text-white text-lg font-bold tracking-wide">MediTriage</span>
          </div>
          <span className="text-blue-200 text-sm font-medium">Doctor Dashboard</span>
        </nav>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1,2,3].map(n => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2 w-16 mx-auto" />
                <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white rounded-xl shadow-sm border-l-4 border-gray-200 px-5 py-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleRetriage = async (id) => {
    setRetriagingId(id);
    try {
      const res = await fetch(`${API}/api/intake/${id}/retriage`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPatients(prev =>
          prev.map(p => p._id === id ? { ...p, ...data.data } : p)
        );
        showToast('AI re-analysis complete');
      } else {
        showToast('Re-triage failed — try again');
      }
    } catch {
      showToast('Could not connect to server');
    } finally {
      setRetriagingId(null);
    }
  };

  // Derived stats
  const urgentCount  = patients.filter(p => p.urgency === 'Emergency' || p.urgency === 'Urgent').length;
  const pendingCount = patients.filter(p => !p.status || p.status === 'pending').length;

  // Filtered list — applies search query and urgency filter together
  const q = searchQuery.toLowerCase();
  const filteredPatients = patients.filter(p => {
    const matchesSearch = !q ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.chiefComplaint || '').toLowerCase().includes(q);

    const matchesUrgency = urgencyFilter === 'All' ||
      (urgencyFilter === 'Unknown' ? !p.urgency : p.urgency === urgencyFilter);

    const matchesStatus = statusFilter === 'All' ||
      (p.status || 'pending') === statusFilter;

    return matchesSearch && matchesUrgency && matchesStatus;
  });

  // Sort the filtered list
  const URGENCY_RANK = { Emergency: 0, Urgent: 1, 'Semi-Urgent': 2, 'Non-Urgent': 3 };
  const sorted = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'urgency') {
      const ra = URGENCY_RANK[a.urgency] ?? 4;
      const rb = URGENCY_RANK[b.urgency] ?? 4;
      return ra - rb;
    }
    if (sortBy === 'name') return (a.firstName || '').localeCompare(b.firstName || '');
    // default: newest
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(sorted.length / PATIENTS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl">✚</span>
          <span className="text-white text-lg font-bold tracking-wide">MediTriage</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm font-medium">Doctor Dashboard</span>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="text-blue-200 hover:text-white text-sm border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Total patients</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-red-600">{urgentCount}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Urgent / Emergency</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Pending review</p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name or chief complaint..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* ── Urgency filter buttons + status dropdown ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {['All', 'Emergency', 'Urgent', 'Semi-Urgent', 'Non-Urgent', 'Unknown'].map(level => (
            <button
              key={level}
              onClick={() => setUrgencyFilter(level)}
              className={urgencyFilter === level
                ? 'bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer'
                : 'bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded-full text-sm hover:bg-gray-50 cursor-pointer'
              }
            >
              {level}
            </button>
          ))}

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ml-auto"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="seen">Seen</option>
            <option value="needs-follow-up">Needs follow-up</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ml-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="urgency">Urgency (High to Low)</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        {/* ── Patient cards ── */}
        <div className="flex flex-col gap-3">
          {paginated.map(patient => {
            const isExpanded   = expandedId === patient._id;
            const borderCls    = URGENCY_LEFT_BORDER[patient.urgency] ?? 'border-l-4 border-gray-300';
            const badgeCls     = URGENCY_BADGE[patient.urgency]       ?? 'bg-gray-100 text-gray-700 border border-gray-300';
            const submitted    = patient.createdAt
              ? new Date(patient.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })
              : 'Unknown date';

            return (
              <div
                key={patient._id}
                onClick={() => setExpandedId(isExpanded ? null : patient._id)}
                className={`bg-white rounded-xl shadow-sm ${borderCls} cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="px-5 py-4">

                  {/* Name + urgency badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeCls}`}>
                      {patient.urgency ?? 'Unknown'}
                    </span>
                  </div>

                  {/* Chief complaint */}
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Chief complaint:</strong> {patient.chiefComplaint || 'Not provided'}
                  </p>

                  {/* Date submitted */}
                  <p className="text-xs text-gray-400">Submitted {submitted}</p>

                  {/* ── Expanded section ── */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <DetailRow label="Urgency reason"      value={patient.urgencyReason       || 'Not available'} />
                      <DetailRow label="Doctor summary"      value={patient.doctorSummary        || 'Not available'} />
                      <DetailRow label="Symptoms"            value={joinOrFallback(patient.symptoms)} />
                      <DetailRow label="Pain level"          value={patient.painLevel != null ? `${patient.painLevel} / 10` : 'Not provided'} />
                      <DetailRow label="Symptom duration"    value={patient.symptomDuration      || 'Not provided'} />
                      <DetailRow label="Existing conditions" value={joinOrFallback(patient.existingConditions)} />
                      <DetailRow label="Current medications" value={joinOrFallback(patient.currentMedications)} />
                      <DetailRow label="Allergies"           value={joinOrFallback(patient.allergies)} />

                      {/* Status dropdown */}
                      <div
                        className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100"
                        onClick={e => e.stopPropagation()}
                      >
                        <label className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Update status:
                        </label>
                        <select
                          value={patient.status || 'pending'}
                          onChange={e => {
                            const newStatus = e.target.value;
                            fetch(`${API}/api/intake/${patient._id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus }),
                            })
                              .then(res => res.json())
                              .then(() => {
                                setPatients(prev =>
                                  prev.map(p => p._id === patient._id ? { ...p, status: newStatus } : p)
                                );
                                showToast(`Status updated to "${newStatus}"`);
                              })
                              .catch(err => console.error('Failed to update status:', err));
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="seen">Seen</option>
                          <option value="needs-follow-up">Needs follow-up</option>
                        </select>
                      </div>

                      {/* Re-triage button */}
                      <div
                        className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleRetriage(patient._id)}
                          disabled={retriagingId === patient._id}
                          className={`text-sm px-4 py-1.5 rounded-lg border transition-colors cursor-pointer
                            ${retriagingId === patient._id
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                          {retriagingId === patient._id ? '⏳ Re-analyzing...' : '🔄 Re-analyze with AI'}
                        </button>
                        {retriagingId === patient._id && (
                          <span className="text-xs text-gray-400">This takes a few seconds...</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expand / collapse hint */}
                  <div className="text-right mt-2">
                    {isExpanded
                      ? <span className="text-xs text-blue-500 font-medium">▼ Click to collapse</span>
                      : <span className="text-xs text-gray-400">▶ Click to expand</span>
                    }
                  </div>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No patients match your search.' : 'No patients on record yet.'}
            </p>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PATIENTS_PER_PAGE + 1}–{Math.min(currentPage * PATIENTS_PER_PAGE, sorted.length)} of {sorted.length} patients
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer
                    ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm border transition-colors cursor-pointer
                        ${page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600 font-medium'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer
                    ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
