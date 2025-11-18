import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import projectsRouter from './projects';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Project routes - protected with service authentication
router.use('/projects', serviceAuthMiddleware, projectsRouter);

export default router;

