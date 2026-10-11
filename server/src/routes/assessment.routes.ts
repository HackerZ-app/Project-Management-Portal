import { Router } from 'express';
import {
  createAssessment,
  getProjectAssessments,
  getAssessmentById,
} from '../controllers/assessment.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Create new assessment (Faculty / Coordinator / Admin)
router.post(
  '/',
  verifyToken,
  checkRole('faculty', 'coordinator', 'admin'),
  createAssessment
);

// Fetch assessments for a project (Accessible to allocated students and faculty)
router.get('/project/:projectId', verifyToken, getProjectAssessments);

// Fetch single assessment details
router.get('/:id', verifyToken, getAssessmentById);

export default router;
