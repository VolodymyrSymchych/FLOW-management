import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();

    // Cache notifications for 30 seconds (real-time data, short TTL)
    // No timestamp validation as notifications table doesn't have updatedAt
    const notifications = await cachedWithValidation(
      CacheKeys.notificationsByUser(session.userId),
      async () => await storage.getNotifications(session.userId),
      {
        ttl: 30, // 30 seconds - short TTL for real-time data
        validate: false, // No validation - rely on TTL only
      }
    );

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

