// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Hardcoded doctor account — password hashed at startup so it's never stored in plaintext
const DOCTOR = {
  email: 'doctor@meditriage.com',
  passwordHash: bcrypt.hashSync('doctor123', 10),
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Accepts { email, password }, returns a signed JWT on success.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== DOCTOR.email || !bcrypt.compareSync(password, DOCTOR.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.status(200).json({ token });
});

export default router;
