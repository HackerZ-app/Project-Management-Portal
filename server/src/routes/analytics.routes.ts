import { Router } from 'express';
import {
  getAnalyticsDashboard,
  exportGradesCSV,
} from '../controllers/analytics.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// All analytics routes require authentication and coordinator or admin privileges
router.use(verifyToken, checkRole('coordinator', 'admin'));

// GET /api/analytics/dashboard - Metrics and MongoDB aggregations
router.get('/dashboard', getAnalyticsDashboard);

// GET /api/analytics/export - Download CSV of student grades and project outcomes
router.get('/export', exportGradesCSV);

export default router;
