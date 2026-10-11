import { Router } from 'express';
import { getProfile, updateProfile, adminUpdateAcademicRecord } from '../controllers/user.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Profile endpoints (Authenticated)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Admin / Coordinator endpoint to update official student academic records
router.patch(
  '/:id/academic-record',
  verifyToken,
  checkRole('coordinator', 'admin'),
  adminUpdateAcademicRecord
);

export default router;
