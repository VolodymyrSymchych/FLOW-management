import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { taskService } from '@/lib/task-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks/[id]/lock
 * Check if task is locked
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const result = await taskService.checkLock(taskId);

    if (result.error) {
      console.error('Task service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Check lock error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check lock' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/[id]/lock
 * Acquire lock on task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const result = await taskService.acquireLock(taskId);

    if (result.error) {
      console.error('Task service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Acquire lock error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to acquire lock' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]/lock
 * Release lock on task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const result = await taskService.releaseLock(taskId);

    if (result.error) {
      console.error('Task service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Release lock error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to release lock' },
      { status: 500 }
    );
  }
}
