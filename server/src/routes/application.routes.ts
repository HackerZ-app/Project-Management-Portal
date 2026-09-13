import { Router } from 'express';
import {
  submitApplication,
  evaluateApplication,
  getMyApplications,
  getFacultyApplications,
} from '../controllers/application.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Student routes
router.post('/', verifyToken, submitApplication);
router.get('/me', verifyToken, getMyApplications);
router.get('/my', verifyToken, getMyApplications);

// Faculty & Coordinator routes
router.get('/faculty', verifyToken, checkRole('faculty', 'coordinator', 'admin'), getFacultyApplications);
router.put('/:id/evaluate', verifyToken, checkRole('faculty', 'coordinator', 'admin'), evaluateApplication);

export default router;
