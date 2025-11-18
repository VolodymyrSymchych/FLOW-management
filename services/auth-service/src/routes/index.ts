import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import authRouter from './auth';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Auth routes - protected with service authentication
router.use('/auth', serviceAuthMiddleware, authRouter);

export default router;

