import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { taskService } from '@/lib/task-service';
import { withRateLimit } from '@/lib/rate-limit';
import { createTaskSchema, validateRequestBody, formatZodError } from '@/lib/validations';
import { storage } from '@/server/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');
    const teamId = searchParams.get('team_id');

    console.log('Fetching tasks for userId:', session.userId, 'projectId:', projectId, 'teamId:', teamId);

    const tasks = projectId
      ? await storage.getTasks(session.userId, parseInt(projectId, 10))
      : teamId && teamId !== 'all'
        ? await storage.getTasksByTeam(parseInt(teamId, 10))
        : await storage.getTasks(session.userId);

    const userProjects = await storage.getUserProjects(session.userId);
    const projectMap = new Map(userProjects.map((p: any) => [p.id, p.name]));
    
    const tasksWithProjects = tasks.map(t => ({
      ...t,
      projectName: t.projectId ? projectMap.get(t.projectId) : null
    }));

    console.log('Found tasks:', tasksWithProjects.length || 0);

    return NextResponse.json({
      tasks: tasksWithProjects,
      total: tasksWithProjects.length,
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        tasks: [], // Fallback to empty tasks
        error: error?.message || 'Failed to get tasks (Service Unavailable)',
      },
      { status: 200 } // Return 200 to suppress client error overlay
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 tasks per 10 minutes per user
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResult = await withRateLimit(request, {
      limit: 20,
      window: 600, // 10 minutes
      identifier: () => `create-task:${session.userId}`,
    });

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();
    console.log('Creating task with data:', { ...data, userId: session.userId });

    // Validate request body
    const validation = validateRequestBody(createTaskSchema, data);
    if (validation.success === false) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 });
    }

    const { title, description, project_id, assignee, due_date, start_date, end_date, status, priority, depends_on, progress } = validation.data;

    // Use task-service microservice
    const result = await taskService.createTask({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      projectId: project_id || undefined,
      assignee: assignee ? assignee.trim() : undefined,
      startDate: start_date ? new Date(start_date).toISOString() : undefined,
      dueDate: due_date ? new Date(due_date).toISOString() : undefined,
      endDate: end_date ? new Date(end_date).toISOString() : undefined,
      status: status || 'todo',
      priority: priority || 'medium',
      dependsOn: depends_on || undefined,
      progress: progress || 0,
    });

    if (result.error) {
      console.error('Task service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log('Task created successfully:', result.task?.id);
    return NextResponse.json({ task: result.task }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    console.error('Error stack:', error.stack);
    // Return more detailed error message
    const errorMessage = error.message || error.detail || error.code || 'Failed to create task';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
