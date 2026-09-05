import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    venue: { type: String, required: true },
    date: { type: String, required: true }, // yyyy-mm-dd
    time: { type: String, required: true }, // HH:mm
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    geofenceRadius: { type: Number, default: 150 }, // meters
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qrToken: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
