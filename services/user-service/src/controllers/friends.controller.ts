import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { friendsService } from '../services/friends.service';
import { ValidationError, NotFoundError, UnauthorizedError } from '@project-scope-analyzer/shared';

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
  async getFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const userId = parseInt(req.user.userId as string, 10);
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
  async sendFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const senderId = parseInt(req.user.userId as string, 10);
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
  async acceptFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const receiverId = parseInt(req.user.userId as string, 10);
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
  async rejectFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const receiverId = parseInt(req.user.userId as string, 10);
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
  async removeFriendship(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const userId = parseInt(req.user.userId as string, 10);
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

