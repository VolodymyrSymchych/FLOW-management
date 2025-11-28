import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /preferences - Get notification preferences
router.get('/', (req, res, next) => notificationController.getPreferences(req, res).catch(next));

// PUT /preferences - Update notification preferences
router.put('/', (req, res, next) => notificationController.updatePreferences(req, res).catch(next));

export default router;
