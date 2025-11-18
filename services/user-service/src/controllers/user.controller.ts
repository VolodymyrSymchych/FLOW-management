import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { ValidationError, NotFoundError } from '@project-scope-analyzer/shared';

const updateProfileSchema = z.object({
  fullName: z.string().max(255).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export class UserController {
  /**
   * GET /users/:id
   * Get user by ID
   */
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID');
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/search?q=query
   * Search users
   */
  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const excludeUserId = req.user?.userId ? parseInt(req.user.userId as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (!query || query.trim().length < 2) {
        res.json({ users: [] });
        return;
      }

      const users = await userService.searchUsers(query, excludeUserId, limit);
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/:id/profile
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID');
      }

      // Only allow users to update their own profile
      if (req.user?.userId !== userId.toString()) {
        res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
        return;
      }

      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const user = await userService.updateUserProfile(userId, validation.data);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/me
   * Get current user profile
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = parseInt(req.user.userId as string, 10);
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

