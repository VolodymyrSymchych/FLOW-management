import { Router } from 'express';
import { friendsController } from '../controllers/friends.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /friends - Get user's friends and pending requests
router.get('/', (req, res, next) => friendsController.getFriends(req, res, next));

// POST /friends/requests - Send a friend request
router.post('/requests', (req, res, next) => friendsController.sendFriendRequest(req, res, next));

// POST /friends/requests/:id/accept - Accept a friend request
router.post('/requests/:id/accept', (req, res, next) => friendsController.acceptFriendRequest(req, res, next));

// POST /friends/requests/:id/reject - Reject a friend request
router.post('/requests/:id/reject', (req, res, next) => friendsController.rejectFriendRequest(req, res, next));

// DELETE /friends/:id - Remove a friendship (unfriend)
router.delete('/:id', (req, res, next) => friendsController.removeFriendship(req, res, next));

export default router;

