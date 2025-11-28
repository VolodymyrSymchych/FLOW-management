import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import notificationsRouter from './notifications';
import preferencesRouter from './preferences';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Notification routes - protected with service authentication
router.use('/notifications', serviceAuthMiddleware, notificationsRouter);

// Preferences routes - protected with service authentication
router.use('/preferences', serviceAuthMiddleware, preferencesRouter);

export default router;
