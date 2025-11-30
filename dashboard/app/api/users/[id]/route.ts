import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { userService } from '@/lib/user-service';
import { storage } from '../../../../../server/storage';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Cache user profile for 5 minutes (rarely changes)
    const userData = await cachedWithValidation(
      CacheKeys.user(userId),
      async () => {
        // Try user-service first
        const result = await userService.getUser(userId);

        if (result.user) {
          return result.user;
        }

        // Fallback to local storage
        if (result.error) {
          console.warn('User service error, falling back to local storage:', result.error);
        }

        const user = await storage.getUser(userId);

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
        };
      },
      {
        ttl: 300, // 5 minutes
        validate: false, // No validation - user profiles rarely change
      }
    );

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

