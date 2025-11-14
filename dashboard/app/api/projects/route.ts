import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../server/storage';
import { cached, invalidateUserCache } from '@/lib/redis';
import { withRateLimit } from '@/lib/rate-limit';
import { createProjectSchema, validateRequestBody, formatZodError } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');

    let userProjects;
    let cacheKey: string;

    if (teamId && teamId !== 'all') {
      // Filter by specific team
      const teamIdNum = parseInt(teamId);

      // Verify user is a member of the team
      const teamMembers = await storage.getTeamMembers(teamIdNum);
      console.log(`Team ${teamIdNum} members:`, teamMembers.map(tm => ({ userId: tm.userId, role: tm.role })));
      console.log(`Current user ID: ${session.userId} (type: ${typeof session.userId})`);

      const isMember = teamMembers.some(tm => {
        console.log(`Comparing tm.userId=${tm.userId} (${typeof tm.userId}) with session.userId=${session.userId} (${typeof session.userId})`);
        return tm.userId === session.userId;
      });

      if (!isMember) {
        console.error(`User ${session.userId} is not a member of team ${teamIdNum}`);
        return NextResponse.json({
          error: 'Not a team member',
          details: { userId: session.userId, teamId: teamIdNum }
        }, { status: 403 });
      }

      console.log(`User ${session.userId} is a member of team ${teamIdNum}, fetching projects...`);
      cacheKey = `projects:team:${teamIdNum}`;
      userProjects = await cached(
        cacheKey,
        async () => await storage.getProjectsByTeam(teamIdNum),
        { ttl: 300 }
      );
      console.log(`Found ${userProjects.length} projects for team ${teamIdNum}`);
    } else {
      // All teams or no filter - get all user's projects
      cacheKey = `projects:user:${session.userId}`;
      userProjects = await cached(
        cacheKey,
        async () => await storage.getUserProjects(session.userId),
        { ttl: 300 }
      );
    }

    return NextResponse.json({
      projects: userProjects,
      total: userProjects.length
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 projects per 10 minutes per user
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResult = await withRateLimit(request, {
      limit: 10,
      window: 600, // 10 minutes
      identifier: () => `create-project:${session.userId}`,
    });

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();

    // Validate request body
    const validation = validateRequestBody(createProjectSchema, data);
    if (validation.success === false) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 });
    }

    const { name, type, industry, teamSize, timeline, budget, startDate, endDate, document, analysisData, score, riskLevel, status, teamId } = validation.data;

    const project = await storage.createProject({
      userId: session.userId,
      name,
      type: type || null,
      industry: industry || null,
      teamSize: teamSize || null,
      timeline: timeline || null,
      budget: budget || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      score: score || 0,
      riskLevel: riskLevel || null,
      status: status || 'in_progress',
      document: document || null,
      analysisData: analysisData ? JSON.stringify(analysisData) : null,
    });

    // Add project to team if teamId provided
    if (teamId) {
      await storage.addProjectToTeam(teamId, project.id);
    }

    // Invalidate user caches after creating project
    await invalidateUserCache(session.userId);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
