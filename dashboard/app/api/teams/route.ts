import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { teamService } from '@/lib/team-service';

export async function GET() {
  try {
    console.log('[Teams API] Starting request');

    const session = await getSession();
    if (!session) {
      console.log('[Teams API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Teams API] Session found for user:', session.userId);

    // Use team-service microservice
    const result = await teamService.getTeams();

    if (result.error) {
      console.error('[Teams API] Team service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log('[Teams API] Found teams:', result.teams?.length || 0);
    return NextResponse.json({ teams: result.teams || [] });
  } catch (error: any) {
    console.error('[Teams API] Error:', error);
    console.error('[Teams API] Error stack:', error?.stack);
    console.error('[Teams API] Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });

    return NextResponse.json(
      {
        error: error?.message || 'Failed to get teams',
        details: process.env.NODE_ENV !== 'production' ? {
          stack: error?.stack,
          code: error?.code,
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Use team-service microservice
    const result = await teamService.createTeam({
      name,
      description: description || undefined,
    });

    if (result.error) {
      console.error('Team service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, team: result.team });
  } catch (error: any) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}
