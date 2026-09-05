import express from 'express';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventQr,
} from '../controllers/eventController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.get('/', protect, asyncHandler(listEvents));
router.post('/', protect, requireRole('organizer'), asyncHandler(createEvent));
router.get('/:id', protect, asyncHandler(getEvent));
router.put('/:id', protect, requireRole('organizer'), asyncHandler(updateEvent));
router.delete('/:id', protect, requireRole('organizer'), asyncHandler(deleteEvent));
router.get('/:id/qrcode', protect, requireRole('organizer'), asyncHandler(getEventQr));

export default router;
