import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projectService } from '@/lib/project-service';
import { storage } from '@/lib/storage';
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

    // Try project-service first
    const result = await projectService.getProjects();
    
    if (result.projects) {
      // If team filter is needed, filter in fallback
      if (teamId && teamId !== 'all') {
        // For now, return all projects - team filtering will be handled by Team Service later
        return NextResponse.json({
          projects: result.projects,
          total: result.total || result.projects.length,
        });
      }
      
      return NextResponse.json({
        projects: result.projects,
        total: result.total || result.projects.length,
      });
    }

    // Fallback to local storage
    if (result.error) {
      console.warn('Project service error, falling back to local storage:', result.error);
    }

    let userProjects;
    let cacheKey: string;

    if (teamId && teamId !== 'all') {
      // Filter by specific team
      const teamIdNum = parseInt(teamId);

      // Verify user is a member of the team
      const teamMembers = await storage.getTeamMembers(teamIdNum);
      const isMember = teamMembers.some(tm => tm.userId === session.userId);

      if (!isMember) {
        return NextResponse.json({
          error: 'Not a team member',
        }, { status: 403 });
      }

      cacheKey = `projects:team:${teamIdNum}`;
      userProjects = await cached(
        cacheKey,
        async () => await storage.getProjectsByTeam(teamIdNum),
        { ttl: 300 }
      );
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

    // Try project-service first
    const result = await projectService.createProject({
      name,
      type: type || undefined,
      industry: industry || undefined,
      teamSize: teamSize || undefined,
      timeline: timeline || undefined,
      budget: budget || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      document: document || undefined,
    });

    if (result.project) {
      // Add project to team if teamId provided (fallback to local storage for now)
      if (teamId) {
        try {
          await storage.addProjectToTeam(teamId, result.project.id);
        } catch (error) {
          console.warn('Failed to add project to team:', error);
        }
      }

      // Invalidate user caches after creating project
      await invalidateUserCache(session.userId);

      return NextResponse.json({ project: result.project }, { status: 201 });
    }

    // Fallback to local storage
    if (result.error) {
      console.warn('Project service error, falling back to local storage:', result.error);
    }

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
