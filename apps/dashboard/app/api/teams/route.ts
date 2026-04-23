import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { teamService } from '@/lib/team-service';
import { storage } from '@/server/storage';
import { cached } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In dev, the microservice at localhost:3006 is never running — go straight to local storage
    const teamServiceUrl = process.env.NEXT_PUBLIC_TEAM_SERVICE_URL || 'http://localhost:3006';
    const isLocalService = teamServiceUrl.includes('localhost') || process.env.NODE_ENV === 'development';
    if (isLocalService) {
      const localTeams = await cached(
        `teams:user:${session.userId}`,
        () => storage.getUserTeams(session.userId),
        { ttl: 120 }
      );
      return NextResponse.json({ teams: localTeams, source: 'local' });
    }

    const result = await teamService.getTeams();

    if (result.error) {
      console.error('[Teams API] Team service error:', result.error);
      const fallbackTeams = await storage.getUserTeams(session.userId);
      return NextResponse.json({ teams: fallbackTeams, source: 'local-fallback' });
    }

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
        teams: [], // Fallback to empty teams to prevent UI crash
        error: error?.message || 'Failed to get teams (Service Unavailable)',
        details: process.env.NODE_ENV !== 'production' ? {
          stack: error?.stack,
          code: error?.code,
        } : undefined
      },
      { status: 200 } // Return 200 to suppress client error overlay
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

    const result = await teamService.createTeam({
      name,
      description: description || undefined,
    });

    if (result.error) {
      console.error('Team service error:', result.error);
      const localTeam = await storage.createTeam({
        name,
        description: description || null,
        ownerId: session.userId,
      });
      return NextResponse.json({ success: true, team: localTeam, source: 'local-fallback' });
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
