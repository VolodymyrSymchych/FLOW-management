import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { friendsService } from '../services/friends.service';
import { ValidationError, NotFoundError, UnauthorizedError, AuthenticatedRequest } from '@project-scope-analyzer/shared';

const sendFriendRequestSchema = z.object({
  receiverEmail: z.string().email().optional(),
  emailOrUsername: z.string().optional(),
  receiverId: z.number().int().positive().optional(),
}).refine(
  (data) => data.receiverEmail || data.emailOrUsername || data.receiverId,
  { message: 'Either receiverEmail, emailOrUsername, or receiverId is required' }
);

export class FriendsController {
  /**
   * GET /friends
   * Get user's friends and pending requests
   */
  async getFriends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const userId = req.userId;
      const [friends, pendingRequests] = await Promise.all([
        friendsService.getFriends(userId),
        friendsService.getPendingFriendRequests(userId),
      ]);

      res.json({ friends, pendingRequests });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /friends/requests
   * Send a friend request
   */
  async sendFriendRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const senderId = req.userId;
      const validation = sendFriendRequestSchema.safeParse(req.body);

      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const { receiverEmail, emailOrUsername, receiverId } = validation.data;
      let targetUserId: number;

      if (receiverId) {
        targetUserId = receiverId;
      } else {
        // Need to resolve user by email or username
        // This would require importing userService
        const { userService } = await import('../services/user.service');
        const searchValue = receiverEmail || emailOrUsername!;

        let user = await userService.getUserByEmail(searchValue);
        if (!user) {
          user = await userService.getUserByUsername(searchValue);
        }

        if (!user) {
          throw new NotFoundError('User not found');
        }

        targetUserId = user.id;
      }

      const friendship = await friendsService.sendFriendRequest(senderId, targetUserId);
      res.json({ success: true, friendship });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /friends/requests/:id/accept
   * Accept a friend request
   */
  async acceptFriendRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const receiverId = req.userId;
      const requestId = parseInt(req.params.id, 10);

      if (isNaN(requestId)) {
        throw new ValidationError('Invalid request ID');
      }

      const friendship = await friendsService.acceptFriendRequest(requestId, receiverId);
      res.json({ success: true, friendship });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /friends/requests/:id/reject
   * Reject a friend request
   */
  async rejectFriendRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const receiverId = req.userId;
      const requestId = parseInt(req.params.id, 10);

      if (isNaN(requestId)) {
        throw new ValidationError('Invalid request ID');
      }

      await friendsService.rejectFriendRequest(requestId, receiverId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /friends/:id
   * Remove a friendship (unfriend)
   */
  async removeFriendship(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const userId = req.userId;
      const friendshipId = parseInt(req.params.id, 10);

      if (isNaN(friendshipId)) {
        throw new ValidationError('Invalid friendship ID');
      }

      await friendsService.removeFriendship(friendshipId, userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const friendsController = new FriendsController();

