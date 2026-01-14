import { Router } from 'express';
import { friendsController } from '../controllers/friends.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management
 */

/**
 * @swagger
 * /friends:
 *   get:
 *     summary: Get user's friends and pending requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends and requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 incomingRequests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 outgoingRequests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', (req, res, next) => friendsController.getFriends(req, res, next));

/**
 * @swagger
 * /friends/requests:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend request sent
 *       400:
 *         description: Invalid request or already sent
 */
router.post('/requests', (req, res, next) => friendsController.sendFriendRequest(req, res, next));

/**
 * @swagger
 * /friends/requests/{id}/accept:
 *   post:
 *     summary: Accept a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID (sender ID)
 *     responses:
 *       200:
 *         description: Friend request accepted
 *       404:
 *         description: Request not found
 */
router.post('/requests/:id/accept', (req, res, next) => friendsController.acceptFriendRequest(req, res, next));

/**
 * @swagger
 * /friends/requests/{id}/reject:
 *   post:
 *     summary: Reject a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID (sender ID)
 *     responses:
 *       200:
 *         description: Friend request rejected
 *       404:
 *         description: Request not found
 */
router.post('/requests/:id/reject', (req, res, next) => friendsController.rejectFriendRequest(req, res, next));

/**
 * @swagger
 * /friends/{id}:
 *   delete:
 *     summary: Remove a friendship (unfriend)
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to unfriend
 *     responses:
 *       200:
 *         description: Friendship removed
 *       404:
 *         description: Friendship not found
 */
router.delete('/:id', (req, res, next) => friendsController.removeFriendship(req, res, next));

export default router;

