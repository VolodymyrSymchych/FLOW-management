import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { messageService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

// POST /api/chat/messages/[id]/create-task - Create task from message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = parseInt(params.id);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, projectId, assignee, dueDate, priority } = body;

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const result = await messageService.createTaskFromMessage(
      messageId,
      session.userId,
      {
        title,
        description,
        projectId,
        assignee,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating task from message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    );
  }
}
