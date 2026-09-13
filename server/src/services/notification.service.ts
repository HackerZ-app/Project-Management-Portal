import mongoose from 'mongoose';
import { Notification, NotificationType, INotification } from '../models/notification.model';
import { Group } from '../models/group.model';
import { Project } from '../models/project.model';
import { emitToUser } from './socket.service';
import { logger } from '../config/logger';

export const notificationService = {
  /**
   * Persist a notification to MongoDB and simultaneously push real-time event to user's private socket room
   */
  async createNotification(params: {
    userId: string | mongoose.Types.ObjectId;
    message: string;
    type?: NotificationType;
    link?: string;
  }): Promise<INotification> {
    const { userId, message, type = 'system', link = '' } = params;

    const notification = await Notification.create({
      user: userId,
      message,
      type,
      link,
      isRead: false,
    });

    // Real-time Push via Socket.IO
    emitToUser(userId.toString(), 'notification', notification);

    logger.info(`[Notification Sent] To: ${userId} - Type: ${type} - Msg: "${message}"`);
    return notification;
  },

  /**
   * Fan-out notification to all members and the leader of a specific group
   */
  async fanOutGroupNotification(params: {
    groupId: string | mongoose.Types.ObjectId;
    message: string;
    type?: NotificationType;
    link?: string;
  }): Promise<INotification[]> {
    const { groupId, message, type = 'system', link = '' } = params;

    const group = await Group.findById(groupId);
    if (!group) return [];

    const recipientSet = new Set<string>();
    if (group.leader) recipientSet.add(group.leader.toString());
    group.members.forEach((m) => recipientSet.add(m.toString()));

    const createdNotifications: INotification[] = [];
    for (const memberId of recipientSet) {
      const notif = await this.createNotification({
        userId: memberId,
        message,
        type,
        link,
      });
      createdNotifications.push(notif);
    }

    return createdNotifications;
  },

  /**
   * Fan-out notification to ALL students allocated to a project (across all allocated groups and solo students)
   */
  async fanOutProjectNotification(params: {
    projectId: string | mongoose.Types.ObjectId;
    message: string;
    type?: NotificationType;
    link?: string;
  }): Promise<INotification[]> {
    const { projectId, message, type = 'system', link = '' } = params;

    const project = await Project.findById(projectId);
    if (!project || !project.allocatedGroups || project.allocatedGroups.length === 0) {
      return [];
    }

    const recipientSet = new Set<string>();

    for (const allocatedId of project.allocatedGroups) {
      // Check if this ID is a group
      const group = await Group.findById(allocatedId);
      if (group) {
        if (group.leader) recipientSet.add(group.leader.toString());
        group.members.forEach((m) => recipientSet.add(m.toString()));
      } else {
        // Solo student ID
        recipientSet.add(allocatedId.toString());
      }
    }

    const createdNotifications: INotification[] = [];
    for (const studentId of recipientSet) {
      const notif = await this.createNotification({
        userId: studentId,
        message,
        type,
        link,
      });
      createdNotifications.push(notif);
    }

    return createdNotifications;
  },

  /**
   * Fetch all notifications for a user along with unread counter
   */
  async getUserNotifications(userId: string | mongoose.Types.ObjectId): Promise<{
    notifications: INotification[];
    unreadCount: number;
  }> {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return { notifications, unreadCount };
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string | mongoose.Types.ObjectId
  ): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string | mongoose.Types.ObjectId): Promise<void> {
    await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
  },
};

export default notificationService;
