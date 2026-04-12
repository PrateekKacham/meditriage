// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Hardcoded doctor account — password hashed at startup so it's never stored in plaintext
const DOCTOR = {
  email: 'doctor@meditriage.com',
  passwordHash: bcrypt.hashSync('doctor123', 10),
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Doctor-only login against the hardcoded account.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== DOCTOR.email || !bcrypt.compareSync(password, DOCTOR.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.status(200).json({ token });
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Creates a new patient account. Returns a JWT on success.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await new User({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 10),
    }).save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(201).json({
      token,
      user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('POST /api/auth/register error:', err.message);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── POST /api/auth/patient-login ─────────────────────────────────────────────
// Authenticates an existing patient account. Returns a JWT on success.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/patient-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('POST /api/auth/patient-login error:', err.message);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

export default router;
