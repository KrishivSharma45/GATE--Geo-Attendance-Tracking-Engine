import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';
import { haversineDistance } from '../utils/geo.js';
import { toCsv } from '../utils/csv.js';

// The heart of the "geo-tagged" requirement: verify the QR is real, the user hasn't
// already checked in, and they are physically within the event's geofence.
export async function scanAttendance(req, res) {
  const { qrToken, lat, lng } = req.body;
  if (!qrToken || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: 'qrToken, lat and lng are required' });
  }

  const event = await Event.findOne({ qrToken });
  if (!event) return res.status(404).json({ message: 'Invalid QR code' });

  const already = await Attendance.findOne({ event: event._id, user: req.user._id });
  if (already) {
    return res.status(409).json({ message: 'Attendance already recorded for this event' });
  }

  const distance = haversineDistance(lat, lng, event.location.lat, event.location.lng);
  if (distance > event.geofenceRadius) {
    return res.status(403).json({
      message: `You are ${Math.round(distance)}m away from the venue — outside the ${event.geofenceRadius}m allowed radius`,
      distance: Math.round(distance),
    });
  }

  const attendance = await Attendance.create({
    event: event._id,
    user: req.user._id,
    scannedLocation: { lat, lng },
    distanceFromVenue: Math.round(distance),
    status: 'present',
  });

  res.status(201).json({ message: 'Attendance marked successfully', attendance, eventTitle: event.title });
}

export async function listAttendance(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your event' });
  }
  const { search } = req.query;
  let records = await Attendance.find({ event: event._id }).populate('user', 'name email registrationId');
  if (search) {
    const re = new RegExp(search, 'i');
    records = records.filter(
      (r) => re.test(r.user.name) || re.test(r.user.email) || re.test(r.user.registrationId)
    );
  }
  res.json({ event: { title: event.title }, records });
}

export async function exportAttendance(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your event' });
  }
  const records = await Attendance.find({ event: event._id }).populate('user', 'name email registrationId');
  const csv = toCsv(records, [
    { label: 'Name', value: (r) => r.user.name },
    { label: 'Registration ID', value: (r) => r.user.registrationId },
    { label: 'Email', value: (r) => r.user.email },
    { label: 'Attendance Status', value: (r) => r.status },
    { label: 'Timestamp', value: (r) => new Date(r.timestamp).toLocaleString() },
  ]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/\s+/g, '_')}_attendance.csv"`);
  res.send(csv);
}
