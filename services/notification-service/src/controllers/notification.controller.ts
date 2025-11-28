import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../types/express';
import { z } from 'zod';
import { ValidationError } from '@project-scope-analyzer/shared';

// Validation schemas
const createNotificationSchema = z.object({
  userId: z.number().optional(),
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  actionUrl: z.string().optional(),
  metadata: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  taskNotifications: z.boolean().optional(),
  projectNotifications: z.boolean().optional(),
  teamNotifications: z.boolean().optional(),
  chatNotifications: z.boolean().optional(),
  paymentNotifications: z.boolean().optional(),
});

export class NotificationController {
  // Get all notifications for the authenticated user
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationService.getUserNotifications(userId, limit, offset);

    res.json({
      notifications,
      limit,
      offset,
    });
  }

  // Get unread notifications
  async getUnreadNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const notifications = await notificationService.getUnreadNotifications(userId);

    res.json({ notifications });
  }

  // Get unread count
  async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);

    res.json({ count });
  }

  // Get notification by ID
  async getNotificationById(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid notification ID');
    }

    const notification = await notificationService.getNotificationById(id, userId);

    res.json({ notification });
  }

  // Create notification (internal or admin use)
  async createNotification(req: AuthenticatedRequest, res: Response) {
    const validated = createNotificationSchema.parse(req.body);

    // If userId not provided in body, use authenticated user's ID
    const userId = validated.userId || req.user!.userId;

    const notification = await notificationService.createNotification({
      ...validated,
      userId,
    });

    res.status(201).json({ notification });
  }

  // Mark notification as read
  async markAsRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid notification ID');
    }

    const notification = await notificationService.markAsRead(id, userId);

    res.json({ notification });
  }

  // Mark all notifications as read
  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const count = await notificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read', count });
  }

  // Delete notification
  async deleteNotification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid notification ID');
    }

    await notificationService.deleteNotification(id, userId);

    res.json({ message: 'Notification deleted successfully' });
  }

  // Delete all read notifications
  async deleteReadNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const count = await notificationService.deleteReadNotifications(userId);

    res.json({ message: 'Read notifications deleted', count });
  }

  // Get user notification preferences
  async getPreferences(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const preferences = await notificationService.getUserPreferences(userId);

    res.json({ preferences });
  }

  // Update user notification preferences
  async updatePreferences(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const validated = updatePreferencesSchema.parse(req.body);

    const preferences = await notificationService.updateUserPreferences(userId, validated);

    res.json({ preferences });
  }
}

export const notificationController = new NotificationController();
