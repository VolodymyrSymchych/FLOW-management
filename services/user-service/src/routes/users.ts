import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /users/me - Get current user profile
router.get('/me', (req, res, next) => userController.getMe(req, res, next));

// GET /users/search - Search users
router.get('/search', (req, res, next) => userController.searchUsers(req, res, next));

// GET /users/:id - Get user by ID
router.get('/:id', (req, res, next) => userController.getUser(req, res, next));

// PUT /users/:id/profile - Update user profile
router.put('/:id/profile', (req, res, next) => userController.updateProfile(req, res, next));

export default router;

