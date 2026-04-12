# MediTriage — AI-Powered Patient Intake & Triage

MediTriage is a full-stack web application that digitizes the patient intake process for medical practices. Patients complete a 4-step intake form before their appointment — capturing personal information, chief complaint, symptoms, and medical history. Once submitted, an AI agent (Llama 4 Scout via Groq) automatically analyzes the patient's data to assign a clinical urgency level and generate a physician-ready summary. Patients track their case status in a personal portal; doctors manage all incoming cases in a protected dashboard.

---

## Features

- **4-step intake form** with client-side validation, phone auto-formatting, and pre-fill from prior submissions
- **AI triage** assigns Emergency / Urgent / Semi-Urgent / Non-Urgent with a plain-English clinical reason and doctor summary
- **Patient portal** shows AI assessment, appointment status, and full submission history
- **PDF report download** — jsPDF generates a formatted intake report client-side, no server round-trip
- **Doctor dashboard** with real-time search, urgency filter buttons, status dropdown, and sort controls (newest, oldest, urgency, name)
- **Pagination** — dashboard shows 8 patients per page with page number buttons and prev/next navigation
- **Re-triage** — doctors can re-run the AI on any existing intake record from the expanded card view
- **Status management** — doctors update per-patient status (Pending / Seen / Needs follow-up) with a single dropdown
- **JWT authentication** with separate patient and doctor login flows and role-based route protection
- **Patient registration** with password strength meter and confirm-password mismatch detection
- **Email confirmation** — Nodemailer sends a styled HTML confirmation email to the patient after every intake
- **Profile editing** — patients update their name, phone, and date of birth from the portal

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite, Tailwind CSS v4 |
| Backend    | Node.js + Express |
| Database   | MongoDB Atlas (Mongoose) |
| AI         | Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` |
| Auth       | JWT + bcrypt |
| Email      | Nodemailer + Gmail SMTP |
| PDF        | jsPDF (client-side) |
| Hosting    | Frontend → Vercel, Backend → Render |

---

## Architecture

```
Patient fills 4-step intake form
  → POST /api/intake  — saves raw form data to MongoDB immediately
  → Groq Llama 4 Scout triages the submission
      (urgency level + urgency reason + doctor summary + extracted data)
  → Triage result patched back onto the MongoDB record
  → Nodemailer sends HTML confirmation email to patient (fire-and-forget)
  → Frontend receives the fully-triaged record and shows Confirmation screen

Patient portal (GET /api/intake, filtered by email)
  → Shows all submissions with urgency badge, status, assessment, and summary
  → PDF download generated client-side from submission data

Doctor dashboard (GET /api/intake, all records)
  → Search, filter, sort, paginate client-side
  → PATCH /api/intake/:id/status  — update patient status
  → POST  /api/intake/:id/retriage — re-run AI triage on demand
```

---

## Live Demo

- **App:** https://meditriage-five.vercel.app
- **Doctor login:** `doctor@meditriage.com` / `doctor123`

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd AI_Patient_Intake+Symptom_Triage_App

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install

# 4. Create backend/.env (see Environment Variables below)

# 5. Start the backend  (http://localhost:5000)
cd backend && npm start

# 6. Start the frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Environment Variables

### `backend/.env`

| Variable       | Description |
|----------------|-------------|
| `MONGO_URI`    | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Groq API key — get one free at console.groq.com |
| `JWT_SECRET`   | Secret string used to sign JWTs |
| `PORT`         | Express server port (default: `5000`) |
| `EMAIL_USER`   | Gmail address used to send confirmation emails |
| `EMAIL_PASS`   | Gmail App Password (not your account password) |

### `frontend/.env`

| Variable       | Description |
|----------------|-------------|
| `VITE_API_URL` | Backend base URL — e.g. `http://localhost:5000` |
