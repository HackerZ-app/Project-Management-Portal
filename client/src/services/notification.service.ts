import api from './api';
import {
  NotificationListResponse,
  NotificationActionResponse,
} from '../types/notification.types';

export const notificationService = {
  /**
   * Fetch all notifications for the authenticated user
   */
  async getMyNotifications(): Promise<NotificationListResponse> {
    const response = await api.get<NotificationListResponse>('/notifications');
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string): Promise<NotificationActionResponse> {
    const response = await api.put<NotificationActionResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read for the user
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    const response = await api.put<NotificationActionResponse>('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
