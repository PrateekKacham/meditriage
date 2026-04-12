# MediTriage — AI-Powered Patient Intake & Triage

MediTriage is a full-stack web application that digitizes the patient intake process for medical practices. Patients complete a 4-step intake form before their appointment — capturing personal information, chief complaint, symptoms, and medical history. Once submitted, an AI agent (Llama 3 via Groq) automatically analyzes the patient's symptoms, medical history, and current medications to assign a clinical urgency level (Emergency / Urgent / Semi-Urgent / Non-Urgent) and generate a concise summary for the receiving physician. Patients can review their AI triage assessment and appointment status in a personal portal, while doctors access a protected dashboard to review, filter, search, and manage all incoming cases.

---

## Why This Project

MediTriage mirrors what companies like EliseAI and PathAI build at production scale — combining full-stack engineering with real LLM integration in a healthcare context. It demonstrates end-to-end ownership of a system that handles user authentication, structured data collection, AI inference, and role-based access control, all in a domain where accuracy and reliability matter.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React + Vite, Tailwind CSS v4 — deployed on Vercel |
| Backend    | Node.js + Express — deployed on Render |
| Database   | MongoDB Atlas |
| AI         | Groq API — Llama 4 Scout (meta-llama/llama-4-scout-17b-16e-instruct) |
| Auth       | JWT + bcrypt |

---

## Key Features

- 4-step patient intake form with client-side validation and phone formatting
- AI triage agent assigns Emergency / Urgent / Semi-Urgent / Non-Urgent with a plain-English reason
- Patient portal showing AI assessment, doctor status, and intake history
- Doctor dashboard with search, urgency filters, status filters, and sort controls
- JWT authentication with separate patient and doctor login flows
- PDF report download from the patient portal (generated client-side with jsPDF)
- Route protection — patients and doctors see only what they should

---

## Architecture

```
Patient submits 4-step form
  → Express POST /api/intake saves record to MongoDB
  → Groq Llama 4 Scout triages the submission (urgency + clinical summary)
  → Triage result saved back to the MongoDB record
  → Patient sees urgency level and summary in their portal
  → Doctor reviews all cases in the dashboard, updates status per patient
```

---

## Live Demo

- **Frontend:** https://meditriage-five.vercel.app
- **Doctor login:** `doctor@meditriage.com` / `doctor123`

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd AI_Patient_Intake+Symptom_Triage_App

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Create backend/.env (see Environment Variables below)

# 5. Run the backend (from /backend)
npm start

# 6. Run the frontend (from /frontend)
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description |
|----------------|-------------|
| `MONGO_URI`    | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Groq API key (get one at console.groq.com) |
| `JWT_SECRET`   | Secret string used to sign JWTs |
| `PORT`         | Port for the Express server (default: 5000) |

### Frontend (`frontend/.env`)

| Variable        | Description |
|-----------------|-------------|
| `VITE_API_URL`  | Base URL of the backend API (e.g. `http://localhost:5000`) |
