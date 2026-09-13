import { Router, Response } from 'express';
import { googleLogin, getMe, devLogin } from '../controllers/auth.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../types/auth.types';

const router = Router();

// ================= Public Routes =================
router.post('/google', googleLogin);
router.post('/dev-login', devLogin);

// ================= Protected Routes =================
router.get('/me', verifyToken, getMe);

// ================= RBAC Verification Routes =================
router.get('/admin-only', verifyToken, checkRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: You are viewing an Admin-only resource',
    user: req.user,
  });
});

router.get('/faculty-only', verifyToken, checkRole('faculty', 'coordinator', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: You are viewing a Faculty/Coordinator resource',
    user: req.user,
  });
});

router.get('/coordinator-only', verifyToken, checkRole('coordinator', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: You are viewing a Coordinator resource',
    user: req.user,
  });
});

router.get('/student-only', verifyToken, checkRole('student', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: You are viewing a Student resource',
    user: req.user,
  });
});

export default router;
