import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import invoicesRouter from './invoices';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Invoice routes - protected with service authentication
router.use('/invoices', serviceAuthMiddleware, invoicesRouter);

export default router;
