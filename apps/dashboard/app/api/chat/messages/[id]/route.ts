import { NextRequest, NextResponse } from 'next/server';
import { isUnauthorizedError, requireAuth } from '@/lib/auth-helper';
import { messageService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

function messageErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Preserves prior isNaN-based validation (no id <= 0 check) */
function parseMessageId(idStr: string): number | null {
  const id = parseInt(idStr, 10);
  return Number.isNaN(id) ? null : id;
}

async function requireAuthAndMessageId(paramsId: string) {
  const { session } = await requireAuth();
  if (!session?.userId) {
    return { error: messageErrorResponse('Unauthorized', 401) };
  }
  const messageId = parseMessageId(paramsId);
  if (messageId === null) {
    return { error: messageErrorResponse('Invalid message ID', 400) };
  }
  return { session, messageId };
}

// GET /api/chat/messages/[id] - Get message by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuthAndMessageId((await params).id);
    if ('error' in result) return result.error;
    const { session, messageId } = result;

    const message = await messageService.getMessageById(messageId, session.userId);
    return NextResponse.json({ message });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return messageErrorResponse('Unauthorized', 401);
    }
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/messages/[id] - Edit message
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuthAndMessageId((await params).id);
    if ('error' in result) return result.error;
    const { session, messageId } = result;

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return messageErrorResponse('Missing content', 400);
    }

    const message = await messageService.editMessage(messageId, session.userId, content);
    return NextResponse.json({ message });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return messageErrorResponse('Unauthorized', 401);
    }
    console.error('Error editing message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to edit message' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/messages/[id] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuthAndMessageId((await params).id);
    if ('error' in result) return result.error;
    const { session, messageId } = result;

    await messageService.deleteMessage(messageId, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return messageErrorResponse('Unauthorized', 401);
    }
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete message' },
      { status: 500 }
    );
  }
}
