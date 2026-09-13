import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(verifyToken);

// GET /api/notifications - Get logged-in user's notifications + unread count
router.get('/', getMyNotifications);

// PUT /api/notifications/:id/read - Mark specific notification as read
router.put('/:id/read', markNotificationRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllNotificationsRead);

export default router;
