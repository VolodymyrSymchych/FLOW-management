import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getBootstrapData } from '@/server/bootstrap';

export const dynamic = 'force-dynamic';

function parseTeamId(request: NextRequest): number | 'all' {
  const teamIdParam = request.nextUrl.searchParams.get('team_id');
  if (!teamIdParam || teamIdParam === 'all') return 'all';
  const teamId = parseInt(teamIdParam, 10);
  return Number.isFinite(teamId) && teamId > 0 ? teamId : 'all';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestedTeamId = parseTeamId(request);
    const data = await getBootstrapData(session.userId, requestedTeamId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Bootstrap] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load bootstrap data' },
      { status: 500 }
    );
  }
}
