import { Router } from 'express';
import { beamsController } from '../controllers/beams.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Beams authentication endpoint
router.post('/auth', authMiddleware, (req, res, next) =>
  beamsController.auth(req, res).catch(next)
);

export default router;
