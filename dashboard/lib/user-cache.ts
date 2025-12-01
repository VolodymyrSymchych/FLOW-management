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

      // Handle both snake_case (from DB) and camelCase (from code)
      const fullName = (user as any).fullName || (user as any).full_name || null;
      const avatarUrl = (user as any).avatarUrl || (user as any).avatar_url || null;
      const emailVerified = (user as any).emailVerified ?? (user as any).email_verified ?? false;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName,
        avatarUrl,
        emailVerified,
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

