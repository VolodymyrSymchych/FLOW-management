import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import usersRouter from './users';
import friendsRouter from './friends';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// User routes - protected with service authentication
router.use('/users', serviceAuthMiddleware, usersRouter);

// Friends routes - protected with service authentication
router.use('/friends', serviceAuthMiddleware, friendsRouter);

export default router;

