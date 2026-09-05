import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['organizer', 'attendee'], default: 'attendee' },
    registrationId: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
