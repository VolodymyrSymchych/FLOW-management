import { Router } from 'express';
import { pusherController } from '../controllers/pusher.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Pusher auth endpoint - requires authentication
router.post('/auth', authMiddleware, (req, res, next) =>
  pusherController.auth(req, res).catch(next)
);

export default router;
