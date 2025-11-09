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

    const forecast = await storage.getCashFlowForecast(session.userId);
    
    return NextResponse.json({ forecast });
  } catch (error: any) {
    console.error('Error fetching cash flow forecast:', error);
    return NextResponse.json({ error: 'Failed to fetch cash flow forecast' }, { status: 500 });
  }
}

