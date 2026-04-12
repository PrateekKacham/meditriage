// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';

const URGENCY_BADGE = {
  'Emergency':   { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  'Urgent':      { background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74' },
  'Semi-Urgent': { background: '#fefce8', color: '#854d0e', border: '1px solid #fde047' },
  'Non-Urgent':  { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
};

// Helper: join an array to a string, or show a fallback if empty/missing
function joinOrFallback(arr, fallback = 'None reported') {
  return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : fallback;
}

// A single label + value row used in the expanded section
function DetailRow({ label, value }) {
  return (
    <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>
      <strong style={{ color: '#111827' }}>{label}:</strong> {value}
    </p>
  );
}

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
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
    return <p style={{ fontFamily: 'sans-serif', padding: '2rem' }}>Loading patients...</p>;
  }

  return (
    <div style={{
      maxWidth: 720,
      margin: '2rem auto',
      padding: '0 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          Doctor Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          {patients.length} {patients.length === 1 ? 'patient' : 'patients'} on record
        </p>
      </div>

      {/* ── Patient cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {patients.map(patient => {
          const isExpanded = expandedId === patient._id;
          const badgeStyle = URGENCY_BADGE[patient.urgency] ?? {
            background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db',
          };
          const submitted = patient.createdAt
            ? new Date(patient.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })
            : 'Unknown date';

          return (
            <div
              key={patient._id}
              onClick={() => setExpandedId(isExpanded ? null : patient._id)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '16px 20px',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              {/* Name + urgency badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>
                  {patient.firstName} {patient.lastName}
                </span>
                <span style={{
                  ...badgeStyle,
                  fontSize: 12, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 12,
                }}>
                  {patient.urgency ?? 'Unknown'}
                </span>
              </div>

              {/* Chief complaint */}
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151' }}>
                <strong>Chief complaint:</strong> {patient.chiefComplaint || 'Not provided'}
              </p>

              {/* Date submitted */}
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                Submitted {submitted}
              </p>

              {/* ── Expanded section ── */}
              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                  <DetailRow label="Urgency reason"       value={patient.urgencyReason        || 'Not available'} />
                  <DetailRow label="Doctor summary"       value={patient.doctorSummary         || 'Not available'} />
                  <DetailRow label="Symptoms"             value={joinOrFallback(patient.symptoms)} />
                  <DetailRow label="Pain level"           value={patient.painLevel != null ? `${patient.painLevel} / 10` : 'Not provided'} />
                  <DetailRow label="Symptom duration"     value={patient.symptomDuration       || 'Not provided'} />
                  <DetailRow label="Existing conditions"  value={joinOrFallback(patient.existingConditions)} />
                  <DetailRow label="Current medications"  value={joinOrFallback(patient.currentMedications)} />
                  <DetailRow label="Allergies"            value={joinOrFallback(patient.allergies)} />
                </div>
              )}

              {/* "Click to expand" hint — only shown when collapsed */}
              {!isExpanded && (
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#d1d5db' }}>Click to expand</span>
                </div>
              )}
            </div>
          );
        })}

        {patients.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: 14 }}>No patients on record yet.</p>
        )}
      </div>
    </div>
  );
}
