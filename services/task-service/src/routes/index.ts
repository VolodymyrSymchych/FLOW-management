import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import tasksRouter from './tasks';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Task routes - protected with service authentication
router.use('/tasks', serviceAuthMiddleware, tasksRouter);

export default router;

