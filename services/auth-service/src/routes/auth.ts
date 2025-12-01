import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import {
  loginRateLimit,
  signupRateLimit,
  verifyEmailRateLimit,
} from '../middleware/rate-limit';

const router = Router();

// Signup: 3 attempts per hour per IP (prevents account spam)
router.post(
  '/signup',
  signupRateLimit,
  authController.signup.bind(authController)
);

// Login: 5 attempts per 15 minutes per IP + email (prevents brute-force)
router.post(
  '/login',
  loginRateLimit,
  authController.login.bind(authController)
);

router.post('/logout', authMiddleware, authController.logout.bind(authController));

// Email verification: 5 attempts per hour per IP (prevents spam)
router.post(
  '/verify-email',
  verifyEmailRateLimit,
  authController.verifyEmail.bind(authController)
);

router.post(
  '/resend-verification',
  verifyEmailRateLimit,
  authController.resendVerificationEmail.bind(authController)
);

router.get('/me', authMiddleware, authController.me.bind(authController));
router.patch('/locale', authMiddleware, authController.updateLocale.bind(authController));

export default router;
