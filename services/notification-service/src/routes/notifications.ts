import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /notifications - Get all notifications
router.get('/', (req, res, next) => notificationController.getNotifications(req, res).catch(next));

// GET /notifications/unread - Get unread notifications
router.get('/unread', (req, res, next) => notificationController.getUnreadNotifications(req, res).catch(next));

// GET /notifications/unread/count - Get unread count
router.get('/unread/count', (req, res, next) => notificationController.getUnreadCount(req, res).catch(next));

// POST /notifications - Create notification (admin/internal)
router.post('/', (req, res, next) => notificationController.createNotification(req, res).catch(next));

// PUT /notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', (req, res, next) => notificationController.markAllAsRead(req, res).catch(next));

// DELETE /notifications/read - Delete all read notifications
router.delete('/read', (req, res, next) => notificationController.deleteReadNotifications(req, res).catch(next));

// GET /notifications/:id - Get notification by ID
router.get('/:id', (req, res, next) => notificationController.getNotificationById(req, res).catch(next));

// PUT /notifications/:id/read - Mark notification as read
router.put('/:id/read', (req, res, next) => notificationController.markAsRead(req, res).catch(next));

// DELETE /notifications/:id - Delete notification
router.delete('/:id', (req, res, next) => notificationController.deleteNotification(req, res).catch(next));

export default router;
