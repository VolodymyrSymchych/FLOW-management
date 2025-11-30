import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { db } from '@/server/db';
import { teams, teamMembers } from '@/shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('[Teams API] Starting request');

    const session = await getSession();
    if (!session) {
      console.log('[Teams API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Teams API] Session found for user:', session.userId);

    // Cache teams for 5 minutes with timestamp validation
    const teamsData = await cachedWithValidation(
      CacheKeys.teamsByUser(session.userId),
      async () => {
        console.log('[Teams API] Fetching teams from storage for user:', session.userId);
        const result = await storage.getUserTeams(session.userId);
        console.log('[Teams API] Found teams:', result.length);
        return result;
      },
      {
        ttl: 300, // 5 minutes
        validate: true,
        getUpdatedAt: async () => {
          // Get the most recent team or team member update for this user
          const timestamps: (Date | null)[] = [];

          try {
            // Get team IDs for this user
            const userTeamMembers = await db
              .select({ teamId: teamMembers.teamId })
              .from(teamMembers)
              .where(eq(teamMembers.userId, session.userId));

            const teamIds = userTeamMembers.map(tm => tm.teamId);
            if (teamIds.length === 0) return null;

            // Most recent team update
            const teamUpdate = await db
              .select({ updatedAt: teams.updatedAt })
              .from(teams)
              .where(eq(teams.id, teamIds[0])) // Drizzle requires single value for eq
              .orderBy(desc(teams.updatedAt))
              .limit(1);
            if (teamUpdate[0]?.updatedAt) {
              timestamps.push(teamUpdate[0].updatedAt);
            }

            // Note: teamMembers table may not have updatedAt field
            // We rely on teams.updatedAt for changes
          } catch (error) {
            console.warn('[Teams] Error getting timestamps:', error);
          }

          // Return the most recent timestamp
          if (timestamps.length === 0) return null;

          const mostRecent = timestamps.reduce((max, current) => {
            if (!max) return current;
            if (!current) return max;
            return current > max ? current : max;
          }, null as Date | null);

          return mostRecent;
        },
      }
    );

    console.log('[Teams API] Returning teams:', teamsData.length);
    return NextResponse.json({ teams: teamsData });
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

    // Invalidate caches after creating team
    await invalidateOnUpdate('team', team.id, session.userId);

    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}
