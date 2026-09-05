import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scannedLocation: {
    lat: Number,
    lng: Number,
  },
  distanceFromVenue: Number,
  status: { type: String, enum: ['present'], default: 'present' },
  timestamp: { type: Date, default: Date.now },
});

// This is what makes "prevent duplicate attendance" free: the DB rejects a second insert.
attendanceSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
