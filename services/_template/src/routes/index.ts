import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';

const router = Router();

// Health and metrics routes (no auth required)
router.use(healthRouter);
router.use(metricsRouter);

// Add your service routes here
// router.use('/api/your-resource', yourResourceRouter);

export default router;

