import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getFromCacheOnly } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';

export const dynamic = 'force-dynamic';

// Dashboard data types
interface DashboardStats {
    projects_in_progress: number;
    total_projects: number;
    completion_rate: number;
    projects_completed: number;
    trends?: {
        projects_in_progress?: { value: number; isPositive: boolean };
        total_projects?: { value: number; isPositive: boolean };
    };
}

interface DashboardProject {
    id: number;
    name: string;
    status?: string;
    risk_level?: string;
    type?: string;
    industry?: string;
    score?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface DashboardData {
    stats: DashboardStats | null;
    projects: DashboardProject[];
    cached: boolean;
    cachedAt?: number;
    teamId?: number | 'all';
}

/**
 * GET /api/dashboard
 * 
 * Returns dashboard data ONLY from Redis cache.
 * No database fallback - if cache is empty, returns null/empty state.
 * 
 * Query params:
 * - team_id: Filter by team (optional, 'all' or number)
 * 
 * This endpoint is optimized for fast dashboard loading by avoiding
 * any database queries. Data is populated by other API calls that
 * write to Redis cache.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.userId;

        // Parse team_id from query params
        const { searchParams } = new URL(request.url);
        const teamIdParam = searchParams.get('team_id');
        const teamId = teamIdParam === 'all' ? 'all' : teamIdParam ? parseInt(teamIdParam, 10) : undefined;

        // Fetch stats and projects from Redis only (no DB fallback)
        // Use team-specific cache keys if team_id is provided
        const statsKey = CacheKeys.statsByUser(userId);
        const projectsKey = teamId && teamId !== 'all'
            ? CacheKeys.projectsByTeam(teamId)
            : CacheKeys.projectsByUser(userId);

        const [stats, projects] = await Promise.all([
            getFromCacheOnly<DashboardStats>(statsKey),
            getFromCacheOnly<DashboardProject[]>(projectsKey),
        ]);

        const dashboardData: DashboardData = {
            stats: stats ?? null,
            projects: projects ?? [],
            cached: stats !== null || (projects !== null && projects.length > 0),
            cachedAt: Date.now(),
            teamId: teamId,
        };

        // Log cache status for debugging
        console.log(`[Dashboard] Redis-only load for user ${userId}:`, {
            hasStats: stats !== null,
            projectsCount: projects?.length ?? 0,
            cached: dashboardData.cached,
            teamId: teamId,
        });

        return NextResponse.json(dashboardData);
    } catch (error: any) {
        console.error('[Dashboard] Error loading from Redis:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to load dashboard data' },
            { status: 500 }
        );
    }
}
