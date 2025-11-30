import { cached, invalidateCache } from './redis';
import { storage } from '../../server/storage';

export interface CachedUser {
  id: number;
  email: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  role: string;
}

/**
 * Get user data from cache or database
 * Uses Redis cache with 1 hour TTL to reduce database queries
 */
export async function getCachedUser(userId: number): Promise<CachedUser | null> {
  return cached(
    `user:${userId}`,
    async () => {
      const user = await storage.getUser(userId);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role,
      };
    },
    { ttl: 3600 } // 1 hour cache
  );
}

/**
 * Invalidate user cache when user data is updated
 * Should be called after email verification, profile updates, etc.
 */
export async function invalidateUserCache(userId: number): Promise<void> {
  await invalidateCache(`user:${userId}`);
}

