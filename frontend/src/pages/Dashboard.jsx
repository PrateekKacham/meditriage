// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';

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
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/intake')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading patients...</p>
      </div>
    );
  }

  // Derived stats
  const urgentCount  = patients.filter(p => p.urgency === 'Emergency' || p.urgency === 'Urgent').length;
  const pendingCount = patients.filter(p => !p.status || p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-blue-900 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl">✚</span>
          <span className="text-white text-lg font-bold tracking-wide">MediTriage</span>
        </div>
        <span className="text-blue-200 text-sm font-medium">Doctor Dashboard</span>
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

        {/* ── Patient cards ── */}
        <div className="flex flex-col gap-3">
          {patients.map(patient => {
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
                            fetch(`http://localhost:5000/api/intake/${patient._id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus }),
                            })
                              .then(res => res.json())
                              .then(() => {
                                setPatients(prev =>
                                  prev.map(p => p._id === patient._id ? { ...p, status: newStatus } : p)
                                );
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
                    </div>
                  )}

                  {/* Click to expand hint */}
                  {!isExpanded && (
                    <div className="text-right mt-2">
                      <span className="text-xs text-gray-300">Click to expand</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {patients.length === 0 && (
            <p className="text-sm text-gray-500">No patients on record yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
