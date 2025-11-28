import { db, notifications, notificationPreferences, Notification, InsertNotification, NotificationPreferences } from '../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError } from '@project-scope-analyzer/shared';

export class NotificationService {
  // Create a new notification
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  // Create multiple notifications (bulk)
  async createBulkNotifications(data: InsertNotification[]): Promise<Notification[]> {
    if (data.length === 0) {
      return [];
    }
    return await db.insert(notifications).values(data).returning();
  }

  // Get all notifications for a user
  async getUserNotifications(userId: number, limit = 50, offset = 0): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Get unread notifications for a user
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .orderBy(desc(notifications.createdAt));
  }

  // Get notification by ID
  async getNotificationById(id: number, userId: number): Promise<Notification> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .limit(1);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  }

  // Mark notification as read
  async markAsRead(id: number, userId: number): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    return updated;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .returning({ id: notifications.id });

    return result.length;
  }

  // Delete notification
  async deleteNotification(id: number, userId: number): Promise<void> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });

    if (result.length === 0) {
      throw new NotFoundError('Notification not found');
    }
  }

  // Delete all read notifications for a user
  async deleteReadNotifications(userId: number): Promise<number> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, true)))
      .returning({ id: notifications.id });

    return result.length;
  }

  // Get unread count
  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return result?.count || 0;
  }

  // Get or create user notification preferences
  async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    let [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (!preferences) {
      // Create default preferences if they don't exist
      [preferences] = await db
        .insert(notificationPreferences)
        .values({ userId })
        .returning();
    }

    return preferences;
  }

  // Update user notification preferences
  async updateUserPreferences(
    userId: number,
    updates: Partial<Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<NotificationPreferences> {
    // Ensure preferences exist first
    await this.getUserPreferences(userId);

    const [updated] = await db
      .update(notificationPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();

    return updated;
  }

  // Check if user should receive notification based on preferences
  async shouldSendNotification(userId: number, notificationType: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);

    if (!preferences.inAppEnabled) {
      return false;
    }

    switch (notificationType) {
      case 'task':
        return preferences.taskNotifications;
      case 'project':
        return preferences.projectNotifications;
      case 'team':
        return preferences.teamNotifications;
      case 'chat':
        return preferences.chatNotifications;
      case 'payment':
        return preferences.paymentNotifications;
      default:
        return true; // Allow other notification types by default
    }
  }

  // Send notification with preference check
  async sendNotification(data: InsertNotification): Promise<Notification | null> {
    const shouldSend = await this.shouldSendNotification(data.userId, data.type);

    if (!shouldSend) {
      return null;
    }

    return await this.createNotification(data);
  }
}

export const notificationService = new NotificationService();
