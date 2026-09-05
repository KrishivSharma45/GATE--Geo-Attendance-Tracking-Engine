import express from 'express';
import { scanAttendance, listAttendance, exportAttendance } from '../controllers/attendanceController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.post('/scan', protect, asyncHandler(scanAttendance));
router.get('/:id', protect, requireRole('organizer'), asyncHandler(listAttendance));
router.get('/:id/export', protect, requireRole('organizer'), asyncHandler(exportAttendance));

export default router;
