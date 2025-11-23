import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import teamsRouter from './teams';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Team routes - protected with authentication
router.use('/teams', teamsRouter);

export default router;
