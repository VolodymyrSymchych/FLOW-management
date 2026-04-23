import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { cached } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await cached(
      `budget:user:${session.userId}`,
      () => storage.getBudgetMetrics(session.userId),
      { ttl: 60 }
    );

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('[Budget API] Error:', error?.message);

    return NextResponse.json({
      error: 'Failed to fetch budget metrics',
      details: process.env.NODE_ENV !== 'production' ? {
        message: error?.message,
        stack: error?.stack,
      } : undefined
    }, { status: 500 });
  }
}
