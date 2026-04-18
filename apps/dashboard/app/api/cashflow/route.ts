import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    if (period === 'week') {
      const dayOfWeek = now.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysFromMonday);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // year
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
    }

    endDate.setHours(23, 59, 59, 999);

    const cashFlowData = await storage.getCashFlowData(session.userId, startDate, endDate);
    
    return NextResponse.json({ cashFlowData, period, startDate: startDate.toISOString(), endDate: endDate.toISOString() });
  } catch (error: any) {
    console.error('Error fetching cash flow data:', error);
    return NextResponse.json({ error: 'Failed to fetch cash flow data' }, { status: 500 });
  }
}

