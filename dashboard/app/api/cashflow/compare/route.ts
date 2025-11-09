import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../server/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'month') as 'week' | 'month' | 'year';
    const compareTo = (searchParams.get('compareTo') || 'previous') as 'previous' | 'same_last_year';

    const comparison = await storage.getCashFlowComparison(session.userId, period, compareTo);
    
    return NextResponse.json({ comparison, period, compareTo });
  } catch (error: any) {
    console.error('Error fetching cash flow comparison:', error);
    return NextResponse.json({ error: 'Failed to fetch cash flow comparison' }, { status: 500 });
  }
}

