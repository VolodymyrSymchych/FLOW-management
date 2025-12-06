import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import filesRouter from './files';

const router = Router();

// Health and metrics (no auth required)
router.use('/health', healthRouter);
router.use('/metrics', metricsRouter);

// File routes (auth required)
router.use('/files', filesRouter);

export default router;
