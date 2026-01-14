import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import {
  loginRateLimit,
  signupRateLimit,
  verifyEmailRateLimit,
} from '../middleware/rate-limit';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post(
  '/signup',
  signupRateLimit,
  authController.signup.bind(authController)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  loginRateLimit,
  authController.login.bind(authController)
);

router.post(
  '/google',
  loginRateLimit,
  authController.google.bind(authController)
);

router.post(
  '/microsoft',
  loginRateLimit,
  authController.microsoft.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
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

router.post(
  '/forgot-password',
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, authController.me.bind(authController));
router.patch('/locale', authMiddleware, authController.updateLocale.bind(authController));

export default router;
