import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../server/storage';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { apiResponses, parseNumericId } from '@/lib/api-route-helpers';

export const dynamic = 'force-dynamic';

const unauthorized = () => apiResponses.unauthorized();
const invalidTaskId = () => apiResponses.badRequest('Invalid task ID');
const taskNotFound = () => apiResponses.notFound('Task not found');
const forbidden = (msg?: string) => apiResponses.forbidden(msg ?? 'Forbidden');

function parseTaskId(idStr: string): number | null {
  return parseNumericId(idStr);
}

function buildTaskUpdateData(data: Record<string, unknown>): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  if (data.status) updateData.status = data.status;
  if (data.title) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority) updateData.priority = data.priority;
  if (data.assignee !== undefined) updateData.assignee = data.assignee;
  if (data.start_date !== undefined) updateData.startDate = data.start_date ? new Date(data.start_date as string) : null;
  if (data.due_date !== undefined) updateData.dueDate = data.due_date ? new Date(data.due_date as string) : null;
  if (data.end_date !== undefined) updateData.endDate = data.end_date ? new Date(data.end_date as string) : null;
  if (data.project_id !== undefined) updateData.projectId = data.project_id;
  if (data.depends_on !== undefined) {
    updateData.dependsOn = data.depends_on ? JSON.stringify(data.depends_on) : null;
  }
  if (data.progress !== undefined) updateData.progress = data.progress;
  return updateData;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const id = parseTaskId(params.id);
    if (id === null) return invalidTaskId();

    const task = await storage.getTask(id);
    if (!task) return taskNotFound();
    if (task.userId !== session.userId) return forbidden();

    return NextResponse.json({ task });
  } catch (error: unknown) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const id = parseTaskId(params.id);
    if (id === null) return invalidTaskId();

    const data = await request.json();

    const originalTask = await storage.getTask(id);
    if (!originalTask) return taskNotFound();
    if (originalTask.userId !== session.userId) return forbidden();

    if (data.project_id !== undefined && data.project_id !== originalTask.projectId) {
      if (data.project_id) {
        const newProject = await storage.getProject(parseInt(String(data.project_id)));
        if (!newProject || newProject.userId !== session.userId) {
          return forbidden("Cannot assign task to another user's project");
        }
      }
    }

    const updateData = buildTaskUpdateData(data) as Record<string, unknown> & { startDate?: Date | null };

    let daysDelta = 0;
    if (data.shift_subtasks && data.start_date && originalTask.startDate) {
      const newStart = new Date(data.start_date);
      const oldStart = new Date(originalTask.startDate);
      daysDelta = Math.round((newStart.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24));
    }

    const task = await storage.updateTask(id, updateData);
    if (!task) return taskNotFound();

    if (data.shift_subtasks && daysDelta !== 0) {
      await storage.shiftSubtasks(id, daysDelta);
    }

    if (task.parentId && (data.start_date !== undefined || data.end_date !== undefined)) {
      await storage.updateParentDateRange(task.parentId);
    }

    await invalidateOnUpdate('task', id, session.userId, {
      projectId: task.projectId || undefined,
    });

    return NextResponse.json({ task });
  } catch (error: unknown) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const id = parseTaskId(params.id);
    if (id === null) return invalidTaskId();

    const task = await storage.getTask(id);
    if (!task) return taskNotFound();
    if (task.userId !== session.userId) return forbidden();

    await storage.deleteTask(id);

    await invalidateOnUpdate('task', id, session.userId, {
      projectId: task.projectId || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
