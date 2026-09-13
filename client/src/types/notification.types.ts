export type NotificationType = 'grading' | 'meeting' | 'system';

export interface Notification {
  _id: string;
  user: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  unreadCount: number;
  count: number;
  notifications: Notification[];
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
  notification?: Notification;
}
