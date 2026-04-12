// src/pages/Portal.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

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
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('user');
  }

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    document.title = 'My Portal — MediTriage';
  }, []);

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

  const downloadReport = (s) => {
    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 20;

    const line = (text, indent = 0) => {
      const maxWidth = 170 - indent;
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(l => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(l, 20 + indent, y);
        y += lineHeight;
      });
    };

    const gap = () => { y += 4; };

    const section = (title) => {
      gap();
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      line(title);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    };

    const field = (label, value) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(label + ':', 20, y);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(value || 'Not provided', 130);
      lines.forEach((l, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(l, 55, y);
        if (i < lines.length - 1) y += lineHeight;
      });
      y += lineHeight;
    };

    // ── Header ──
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('MediTriage', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Patient Intake Report', 20, y);
    y += 6;

    const submittedDate = s.createdAt
      ? new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unknown date';
    doc.text('Submitted: ' + submittedDate, 20, y);
    y += 10;

    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setTextColor(0, 0, 0);

    // ── Personal Info ──
    section('PERSONAL INFORMATION');
    field('Name',  `${s.firstName || ''} ${s.lastName || ''}`.trim());
    field('Email', s.email || 'Not provided');
    field('Phone', s.phone || 'Not provided');
    field('DOB',   s.dateOfBirth || 'Not provided');

    // ── Chief Complaint ──
    section('CHIEF COMPLAINT');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    line(s.chiefComplaint || 'Not provided');

    // ── Symptoms ──
    section('SYMPTOMS');
    field('Symptoms',   Array.isArray(s.symptoms) && s.symptoms.length ? s.symptoms.join(', ') : 'None selected');
    field('Duration',   s.symptomDuration || 'Not provided');
    field('Pain Level', s.painLevel != null ? `${s.painLevel} / 10` : 'Not provided');

    // ── Medical History ──
    section('MEDICAL HISTORY');
    field('Conditions',  Array.isArray(s.existingConditions) && s.existingConditions.length ? s.existingConditions.join(', ') : 'None');
    field('Allergies',   Array.isArray(s.allergies) && s.allergies.length ? s.allergies.join(', ') : 'None');
    field('Medications', Array.isArray(s.currentMedications) && s.currentMedications.length ? s.currentMedications.join(', ') : 'None');

    // ── AI Triage Results ──
    if (s.urgency || s.urgencyReason || s.doctorSummary) {
      gap();
      doc.setDrawColor(229, 231, 235);
      doc.line(20, y, 190, y);
      y += 8;

      section('AI TRIAGE ASSESSMENT');
      field('Urgency', s.urgency || 'Pending');
      if (s.urgencyReason) {
        doc.setFont('helvetica', 'bold');
        doc.text('Assessment:', 20, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        line(s.urgencyReason, 4);
      }
      if (s.doctorSummary) {
        gap();
        doc.setFont('helvetica', 'bold');
        doc.text('Clinical Summary:', 20, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        line(s.doctorSummary, 4);
      }
    }

    // ── Footer ──
    gap();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by MediTriage — AI-powered patient intake system', 20, 285);

    // ── Save ──
    const fileName = `MediTriage_Report_${s.firstName || 'Patient'}_${submittedDate.replace(/,/g, '').replace(/ /g, '_')}.pdf`;
    doc.save(fileName);
  };

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => { window.location.href = '/profile'; }}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer border-2 border-blue-400 hover:border-blue-300 transition-colors"
              title="Edit profile"
            >
              {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()}
            </button>
            <span className="text-blue-200 text-sm font-medium hidden sm:inline">Patient Portal</span>
          </div>
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
          <div className="flex flex-col gap-4">
            {[1,2].map(n => (
              <div key={n} className="bg-white rounded-xl shadow-sm border-l-4 border-gray-200 px-5 py-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
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

                  {/* Download Report */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => downloadReport(s)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer bg-transparent border-none flex items-center gap-1"
                    >
                      ⬇ Download Report
                    </button>
                  </div>
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
