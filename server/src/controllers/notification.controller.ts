import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { notificationService } from '../services/notification.service';
import { AppError } from '../middlewares/error.middleware';

/**
 * Fetch all notifications for the authenticated user
 * GET /api/notifications
 */
export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { notifications, unreadCount } = await notificationService.getUserNotifications(userId!);

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PUT /api/notifications/:id/read
 */
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await notificationService.markAsRead(id, userId!);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    await notificationService.markAllAsRead(userId!);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
