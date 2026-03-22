// src/api/intake.js
// All calls to our backend live here in one place.
//
// CONCEPT: Why a separate api/ folder?
// ─────────────────────────────────────
// We could write fetch() calls directly inside our components,
// but that mixes two responsibilities together: UI logic and data logic.
// Keeping API calls in their own file means:
//   1. If the backend URL changes, we update it in ONE place only
//   2. Our components stay clean — they just call submitIntake() and
//      don't need to know anything about URLs, headers, or fetch
// This pattern is called "separation of concerns" and is used in
// every professional React codebase.

// import.meta.env.VITE_API_URL reads from the .env file in the frontend
// In development:  http://localhost:5000  (from our .env file)
// In production:   our Render backend URL (set in Vercel dashboard later)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// submitIntake — sends patient form data to the backend
// formData: the full object containing all 4 steps of the form
export const submitIntake = async (formData) => {
  // fetch() is the built-in browser function for making HTTP requests
  const res = await fetch(`${BASE_URL}/api/intake`, {
    method: 'POST',                           // we are SENDING new data
    headers: {
      'Content-Type': 'application/json',     // tells the server we're sending JSON
    },
    body: JSON.stringify(formData),           // converts JS object → JSON string
  });

  // Parse the response body from JSON string → JS object
  const data = await res.json();

  // res.ok is true for status codes 200-299 (success)
  // If the server returned 400 or 500, we throw an error so the
  // calling component can catch it and show an error message
  if (!res.ok) throw new Error(data.message || 'Submission failed');

  return data; // { message: 'Intake submitted successfully', intake: {...} }
};
