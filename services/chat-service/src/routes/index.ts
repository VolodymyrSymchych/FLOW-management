import { Router } from 'express';
import healthRouter from './health';
import metricsRouter from './metrics';
import chatsRouter from './chats';
import messagesRouter from './messages';
import pusherRouter from './pusher';
import beamsRouter from './beams';
import { serviceAuthMiddleware } from '../middleware/service-auth';

const router = Router();

// Health and metrics routes (no auth required - needed for monitoring)
router.use(healthRouter);
router.use(metricsRouter);

// Pusher auth route (has its own auth middleware)
router.use('/pusher', pusherRouter);

// Beams auth route (has its own auth middleware)
router.use('/beams', beamsRouter);

// Chat routes - protected with service authentication
router.use('/chats', serviceAuthMiddleware, chatsRouter);
router.use('/messages', serviceAuthMiddleware, messagesRouter);

export default router;
