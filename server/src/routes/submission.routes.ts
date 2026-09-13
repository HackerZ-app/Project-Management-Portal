import { Router } from 'express';
import {
  submitWork,
  getAssessmentSubmissions,
  getMySubmission,
  gradeSubmission,
} from '../controllers/submission.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { uploadSubmissionFile } from '../middlewares/upload.middleware';

const router = Router();

// Student submission endpoint (consumes multipart/form-data via uploadSubmissionFile)
router.post('/', verifyToken, uploadSubmissionFile, submitWork);

// Faculty view submissions for grading
router.get(
  '/assessment/:assessmentId',
  verifyToken,
  checkRole('faculty', 'coordinator', 'admin'),
  getAssessmentSubmissions
);

// Student check their own submission for an assessment
router.get('/assessment/:assessmentId/me', verifyToken, getMySubmission);

// Faculty grade or re-evaluate a submission
router.put(
  '/:id/grade',
  verifyToken,
  checkRole('faculty', 'coordinator', 'admin'),
  gradeSubmission
);

export default router;
