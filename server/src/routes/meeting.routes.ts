import { Router } from 'express';
import {
  scheduleMeeting,
  getProjectMeetings,
  getFacultyMeetings,
  logMeetingMinutes,
} from '../controllers/meeting.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Schedule a new meeting (Faculty/Coordinator/Admin)
router.post(
  '/',
  verifyToken,
  checkRole('faculty', 'coordinator', 'admin'),
  scheduleMeeting
);

// Get meetings for a specific project
router.get('/project/:projectId', verifyToken, getProjectMeetings);

// Get all meetings for the logged-in faculty
router.get(
  '/faculty',
  verifyToken,
  checkRole('faculty', 'coordinator', 'admin'),
  getFacultyMeetings
);

// Log meeting minutes and transition to 'completed'
router.put(
  '/:id/minutes',
  verifyToken,
  checkRole('faculty', 'coordinator', 'admin'),
  logMeetingMinutes
);

export default router;
