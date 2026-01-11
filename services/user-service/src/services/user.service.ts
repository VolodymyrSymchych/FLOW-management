import { db, users } from '../db';
import { eq, and, or, sql } from 'drizzle-orm';
import { logger } from '@project-scope-analyzer/shared';

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileInput {
  fullName?: string;
  avatarUrl?: string;
}

export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<UserProfile | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Error getting user by ID', { error, userId });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await db.query.users.findFirst({
        where: and(eq(users.email, email), eq(users.isActive, true)),
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Error getting user by email', { error, email });
      throw error;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      const user = await db.query.users.findFirst({
        where: and(eq(users.username, username), eq(users.isActive, true)),
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Error getting user by username', { error, username });
      throw error;
    }
  }

  /**
   * Search users by query (email, username, or fullName)
   */
  async searchUsers(query: string, excludeUserId?: number, limit: number = 10): Promise<UserProfile[]> {
    try {
      const searchTerm = `%${query.trim().toLowerCase()}%`;

      const conditions = [
        eq(users.isActive, true),
        or(
          sql`LOWER(${users.username}) LIKE ${searchTerm}`,
          sql`LOWER(${users.email}) LIKE ${searchTerm}`,
          sql`LOWER(${users.fullName}) LIKE ${searchTerm}`
        ),
      ];

      if (excludeUserId) {
        conditions.push(sql`${users.id} != ${excludeUserId}`);
      }

      const matchingUsers = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          emailVerified: users.emailVerified,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(and(...conditions))
        .limit(limit);

      return matchingUsers.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error) {
      logger.error('Error searching users', { error, query });
      throw error;
    }
  }

  /**
   * Update user profile
   * Note: This service can only update profile fields, not auth-related fields
   */
  async updateUserProfile(userId: number, input: UpdateUserProfileInput): Promise<UserProfile | null> {
    try {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.fullName !== undefined) {
        updateData.fullName = input.fullName;
      }

      if (input.avatarUrl !== undefined) {
        updateData.avatarUrl = input.avatarUrl;
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return null;
      }

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        emailVerified: updatedUser.emailVerified,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      logger.error('Error updating user profile', { error, userId, input });
      throw error;
    }
  }
}

export const userService = new UserService();

