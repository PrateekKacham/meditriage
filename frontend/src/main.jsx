// src/main.jsx — the entry point for the React application
//
// CONCEPT: How React starts up
// ─────────────────────────────
// When the browser loads your app, it first loads index.html.
// index.html has one important line:
//   <div id="root"></div>
// That's an empty div — a blank container waiting to be filled.
//
// main.jsx's job is to:
//   1. Find that empty div (#root)
//   2. Tell React to take control of it
//   3. Render the App component inside it
//
// After this runs, React owns the entire page and handles
// all updates, clicks, and re-renders from here on.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';  // global styles (currently empty — that's fine)
import App from './App';

// document.getElementById('root') finds the <div id="root"> in index.html
// createRoot() tells React to manage that div
// .render() puts the App component inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter enables client-side routing for the whole app.
        It must wrap everything that uses Routes, Route, or Link. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);