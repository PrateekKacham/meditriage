// backend/services/emailService.js
// ─────────────────────────────────────────────────────────────────────────────
// MediTriage — Email Service
// Sends a triage confirmation email to the patient after intake is processed.
// Uses Nodemailer with Gmail SMTP (App Password auth).
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTriageConfirmation({ to, firstName, urgency, urgencyReason, doctorSummary, submittedDate }) {
  const urgencyColors = {
    'Emergency':   '#dc2626',
    'Urgent':      '#ea580c',
    'Semi-Urgent': '#ca8a04',
    'Non-Urgent':  '#16a34a',
  };
  const color = urgencyColors[urgency] || '#6b7280';

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">✚</span>
        <h1 style="color: #2563eb; margin: 8px 0 4px;">MediTriage</h1>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">Patient Intake Confirmation</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
        <p style="margin: 0 0 16px; font-size: 15px; color: #111827;">
          Hi <strong>${firstName}</strong>, your intake form has been received and analyzed.
        </p>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">Submitted: ${submittedDate}</p>
      </div>

      <div style="border-left: 4px solid ${color}; background: #fff; border-radius: 0 12px 12px 0; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="background: ${color}20; color: ${color}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; border: 1px solid ${color}40;">
            ${urgency ?? 'Pending review'}
          </span>
        </div>
        ${urgencyReason ? `
        <p style="margin: 0 0 12px; font-size: 14px; color: #374151;">
          <strong>Assessment:</strong> ${urgencyReason}
        </p>` : ''}
        ${doctorSummary ? `
        <p style="margin: 0; font-size: 14px; color: #374151;">
          <strong>Clinical summary:</strong> ${doctorSummary}
        </p>` : ''}
      </div>

      <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #1d4ed8;">
          💡 Log in to your patient portal to view your full report and track your case status.
        </p>
      </div>

      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        This is an automated message from MediTriage. Please do not reply to this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"MediTriage" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your MediTriage intake has been received — ${urgency ?? 'Pending review'}`,
    html,
  });
}
