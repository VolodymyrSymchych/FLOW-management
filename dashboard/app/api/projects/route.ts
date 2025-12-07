import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projectService } from '@/lib/project-service';
import { withRateLimit } from '@/lib/rate-limit';
import { createProjectSchema, validateRequestBody, formatZodError } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team_id from query params
    const { searchParams } = new URL(request.url);
    const teamIdParam = searchParams.get('team_id');
    const teamId = teamIdParam === 'all' ? 'all' : teamIdParam ? parseInt(teamIdParam, 10) : undefined;

    // Use project-service microservice
    const result = await projectService.getProjects(teamId);

    if (result.error) {
      console.error('Project service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      projects: result.projects || [],
      total: result.total || 0,
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

    const { name, type, industry, teamSize, timeline, budget, startDate, endDate, document } = validation.data;

    // Use project-service microservice
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

    if (result.error) {
      console.error('Project service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ project: result.project }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
