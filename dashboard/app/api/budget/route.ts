import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../server/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await storage.getBudgetMetrics(session.userId);
    
    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Error fetching budget metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch budget metrics' }, { status: 500 });
  }
}

