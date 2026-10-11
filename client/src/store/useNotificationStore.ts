import { create } from 'zustand';
import { Notification } from '../types/notification.types';
import notificationService from '../services/notification.service';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        set({
          notifications: res.notifications || [],
          unreadCount: res.unreadCount || 0,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('[NotificationStore] Failed to fetch notifications:', err);
      set({ isLoading: false });
    }
  },

  addNotification: (newNotif: Notification) => {
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('[NotificationStore] Failed to mark as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('[NotificationStore] Failed to mark all as read:', err);
    }
  },
}));

export default useNotificationStore;
