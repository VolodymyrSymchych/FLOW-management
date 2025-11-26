import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { cached, invalidateUserCache } from '@/lib/redis';

export async function GET() {
  try {
    console.log('[Teams API] Starting request');

    const session = await getSession();
    if (!session) {
      console.log('[Teams API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Teams API] Session found for user:', session.userId);

    // Cache teams for 5 minutes since they don't change frequently
    const teams = await cached(
      `teams:user:${session.userId}`,
      async () => {
        console.log('[Teams API] Fetching teams from storage for user:', session.userId);
        const result = await storage.getUserTeams(session.userId);
        console.log('[Teams API] Found teams:', result.length);
        return result;
      },
      { ttl: 300 }
    );

    console.log('[Teams API] Returning teams:', teams.length);
    return NextResponse.json({ teams });
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

    const team = await storage.createTeam({
      name,
      description: description || null,
      ownerId: session.userId,
    });

    await storage.addTeamMember({
      teamId: team.id,
      userId: session.userId,
      role: 'owner',
    });

    // Invalidate user caches after creating team
    await invalidateUserCache(session.userId);

    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}
