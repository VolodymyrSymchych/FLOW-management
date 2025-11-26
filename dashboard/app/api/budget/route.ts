import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('[Budget API] Starting request');

    const session = await getSession();
    if (!session) {
      console.log('[Budget API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Budget API] Fetching metrics for user:', session.userId);
    const metrics = await storage.getBudgetMetrics(session.userId);
    console.log('[Budget API] Metrics fetched successfully');

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('[Budget API] Error:', error);
    console.error('[Budget API] Error stack:', error?.stack);
    console.error('[Budget API] Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });

    return NextResponse.json({
      error: 'Failed to fetch budget metrics',
      details: process.env.NODE_ENV !== 'production' ? {
        message: error?.message,
        stack: error?.stack,
      } : undefined
    }, { status: 500 });
  }
}
