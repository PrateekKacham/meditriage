// backend/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ['patient', 'doctor'], default: 'patient' },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
