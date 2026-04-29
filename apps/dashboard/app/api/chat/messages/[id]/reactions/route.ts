import { NextRequest, NextResponse } from 'next/server';
import { isUnauthorizedError, requireAuth } from '@/lib/auth-helper';
import { messageService } from '@/lib/chat-service';
import { triggerChatEvent, PusherEvent } from '@/lib/pusher-server';

export const dynamic = 'force-dynamic';

// POST /api/chat/messages/[id]/reactions - Add reaction to message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = parseInt((await params).id);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Missing emoji' }, { status: 400 });
    }

    const [message, reaction] = await Promise.all([
      messageService.getMessageById(messageId, session.userId),
      messageService.addReaction(messageId, session.userId, emoji),
    ]);

    if (message?.chatId) {
      void triggerChatEvent(message.chatId, PusherEvent.MESSAGE_REACTION, { messageId, emoji, userId: session.userId });
    }

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/messages/[id]/reactions - Remove reaction from message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = parseInt((await params).id);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Missing emoji' }, { status: 400 });
    }

    const message = await messageService.getMessageById(messageId, session.userId);
    await messageService.removeReaction(messageId, session.userId, emoji);

    if (message?.chatId) {
      void triggerChatEvent(message.chatId, PusherEvent.MESSAGE_REACTION, { messageId, emoji, userId: session.userId, removed: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
