import { Router } from 'express';
import {
  createProject,
  getProjects,
  getFacultyProjects,
  getProjectById,
  releaseProjectGrades,
} from '../controllers/project.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Create project - strictly faculty, coordinator, admin
router.post('/', verifyToken, checkRole('faculty', 'coordinator', 'admin'), createProject);

// Browse projects - authenticated users
router.get('/', verifyToken, getProjects);

// Faculty personal created projects
router.get('/faculty/me', verifyToken, checkRole('faculty', 'coordinator', 'admin'), getFacultyProjects);

// Coordinator/Admin final grade release workflow
router.put(
  '/:projectId/release-grades',
  verifyToken,
  checkRole('coordinator', 'admin'),
  releaseProjectGrades
);

// Single project detail
router.get('/:id', verifyToken, getProjectById);

export default router;
