// server.js — the entry point for our Express backend
// This file starts the server and connects to MongoDB

import 'dotenv/config';               // reads our .env file and loads MONGO_URI, PORT into process.env
import express from 'express';        // the framework that handles HTTP requests
import cors from 'cors';              // allows our React frontend to talk to this backend
import mongoose from 'mongoose';      // connects to and communicates with MongoDB
import intakeRoutes from './routes/intake.js'; // our intake form routes

const app = express();                // creates the Express application
const PORT = process.env.PORT || 5000; // ← must be uppercase PORT, not port

// --- Middleware ---
// Middleware are functions that run on every request before it hits your routes

// cors() allows requests from a different origin (our React app on port 5173)
// Without this, the browser would block the request for security reasons
app.use(cors({ origin: 'https://meditriage-five.vercel.app' }));

// express.json() automatically parses incoming JSON request bodies
// Without this, req.body would be undefined when the frontend sends form data
app.use(express.json());

// --- Routes ---
// Any request starting with /api/intake gets handled by routes/intake.js
app.use('/api/intake', intakeRoutes); // ← this line was missing in your version

// --- Health check ---
// Visit http://localhost:5000 in browser to confirm the server is running
// The '/' means the root URL — just localhost:5000 with nothing after it
app.get('/', (req, res) => {
  res.send('Patient Intake API is running ✓');
});

// --- MongoDB connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // wait up to 10 seconds to connect
    socketTimeoutMS: 45000,          // close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log('✓ Connected to MongoDB Atlas');
    // Only start the server AFTER successfully connecting to the database
    // This ensures we never accept requests before the DB is ready
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // If MongoDB connection fails, log the error and stop
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1); // exit the process so nodemon can restart cleanly
  });