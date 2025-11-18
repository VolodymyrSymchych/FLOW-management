import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';

const router = Router();

// Signup: 3 attempts per 15 minutes per IP
router.post(
  '/signup',
  rateLimit({
    limit: 3,
    window: 900, // 15 minutes
    identifier: (req) => `signup:${req.ip}`,
  }),
  authController.signup.bind(authController)
);

// Login: 5 attempts per 5 minutes per IP
router.post(
  '/login',
  rateLimit({
    limit: 5,
    window: 300, // 5 minutes
    identifier: (req) => `login:${req.ip}`,
  }),
  authController.login.bind(authController)
);

router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;

