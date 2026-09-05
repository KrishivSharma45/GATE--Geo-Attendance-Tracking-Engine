import crypto from 'crypto';
import Event from '../models/Event.js';
import { generateQrDataUrl } from '../utils/qr.js';

export async function createEvent(req, res) {
  const { title, description, venue, date, time, lat, lng, geofenceRadius } = req.body;
  if (!title || !venue || !date || !time || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: 'Missing required event fields (title, venue, date, time, lat, lng)' });
  }
  const qrToken = crypto.randomUUID();
  const event = await Event.create({
    title,
    description,
    venue,
    date,
    time,
    location: { lat, lng },
    geofenceRadius: geofenceRadius || 150,
    organizer: req.user._id,
    qrToken,
  });
  res.status(201).json({ event });
}

export async function listEvents(req, res) {
  const { search } = req.query;
  const filter = {};
  if (req.user.role === 'organizer') {
    filter.organizer = req.user._id;
  }
  if (search) {
    filter.$or = [{ title: new RegExp(search, 'i') }, { venue: new RegExp(search, 'i') }];
  }
  const events = await Event.find(filter).sort({ date: 1, time: 1 });
  res.json({ events });
}

export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ event });
}

export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your event' });
  }
  const fields = ['title', 'description', 'venue', 'date', 'time', 'geofenceRadius'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) event[f] = req.body[f];
  });
  if (req.body.lat !== undefined) event.location.lat = req.body.lat;
  if (req.body.lng !== undefined) event.location.lng = req.body.lng;
  await event.save();
  res.json({ event });
}

export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your event' });
  }
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
}

export async function getEventQr(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const qrDataUrl = await generateQrDataUrl(event.qrToken);
  res.json({ qrDataUrl });
}
