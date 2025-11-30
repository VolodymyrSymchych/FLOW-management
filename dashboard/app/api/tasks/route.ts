import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { cachedWithValidation, invalidateUserCache } from '@/lib/redis';
import { withRateLimit } from '@/lib/rate-limit';
import { createTaskSchema, validateRequestBody, formatZodError } from '@/lib/validations';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { db } from '@/server/db';
import { tasks } from '@/shared/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';

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

    let tasksData;
    let cacheKey: string;

    if (teamId && teamId !== 'all') {
      // Filter by team
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

      console.log(`User ${session.userId} is a member of team ${teamIdNum}, fetching tasks...`);
      cacheKey = CacheKeys.tasksByTeam(teamIdNum);
      tasksData = await cachedWithValidation(
        cacheKey,
        async () => await storage.getTasksByTeam(teamIdNum),
        {
          ttl: 180, // 3 minutes
          validate: true,
          getUpdatedAt: async () => {
            // Get the most recent updatedAt from team tasks
            // For simplicity, we get max updatedAt from all tasks
            // In production, you might want to join with team projects
            const result = await db
              .select({ updatedAt: tasks.updatedAt })
              .from(tasks)
              .where(isNull(tasks.deletedAt))
              .orderBy(desc(tasks.updatedAt))
              .limit(1);

            return result[0]?.updatedAt || null;
          },
        }
      );
      console.log(`Found ${tasksData.length} tasks for team ${teamIdNum}`);
    } else if (projectId) {
      // Filter by project
      cacheKey = CacheKeys.tasksByUserAndProject(session.userId, parseInt(projectId));
      tasksData = await cachedWithValidation(
        cacheKey,
        async () => await storage.getTasks(session.userId, parseInt(projectId)),
        {
          ttl: 180, // 3 minutes
          validate: true,
          getUpdatedAt: async () => {
            const result = await db
              .select({ updatedAt: tasks.updatedAt })
              .from(tasks)
              .where(and(
                eq(tasks.projectId, parseInt(projectId)),
                isNull(tasks.deletedAt)
              ))
              .orderBy(desc(tasks.updatedAt))
              .limit(1);

            return result[0]?.updatedAt || null;
          },
        }
      );
    } else {
      // All tasks for user
      cacheKey = CacheKeys.tasksByUser(session.userId);
      tasksData = await cachedWithValidation(
        cacheKey,
        async () => await storage.getTasks(session.userId),
        {
          ttl: 180, // 3 minutes
          validate: true,
          getUpdatedAt: async () => {
            const result = await db
              .select({ updatedAt: tasks.updatedAt })
              .from(tasks)
              .where(and(
                eq(tasks.userId, session.userId),
                isNull(tasks.deletedAt)
              ))
              .orderBy(desc(tasks.updatedAt))
              .limit(1);

            return result[0]?.updatedAt || null;
          },
        }
      );
    }

    console.log('Found tasks:', tasksData.length);

    return NextResponse.json({ tasks: tasksData });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
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

    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      projectId: project_id || null,
      userId: session.userId,
      assignee: assignee ? assignee.trim() : null,
      startDate: start_date ? new Date(start_date) : null,
      dueDate: due_date ? new Date(due_date) : null,
      endDate: end_date ? new Date(end_date) : null,
      status: status || 'todo',
      priority: priority || 'medium',
      dependsOn: depends_on ? JSON.stringify(depends_on) : null,
      progress: progress || 0,
    };

    console.log('Task data to insert:', taskData);

    const task = await storage.createTask(taskData);

    // Invalidate caches after creating task
    await invalidateOnUpdate('task', task.id, session.userId, {
      projectId: task.projectId || undefined,
      // Note: teamId would need to be passed or determined from the project
    });

    console.log('Task created successfully:', task.id);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    console.error('Error stack:', error.stack);
    // Return more detailed error message
    const errorMessage = error.message || error.detail || error.code || 'Failed to create task';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
