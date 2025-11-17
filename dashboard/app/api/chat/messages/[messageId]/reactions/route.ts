import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { db } from '@/server/db';
import { chatMessages, chatMembers } from '@/shared/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/messages/[messageId]/reactions - Add reaction to message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messageId = parseInt(params.messageId);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const body = await request.json();
    const { emoji } = body;

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Verify user has access to the message (is member of the chat)
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId));

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const [member] = await db
      .select()
      .from(chatMembers)
      .where(and(
        eq(chatMembers.chatId, message.chatId),
        eq(chatMembers.userId, session.userId)
      ));

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const reaction = await storage.addMessageReaction({
      messageId,
      userId: session.userId,
      emoji,
    });

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    // Check if it's a unique constraint violation (already reacted)
    if (error.message?.includes('unique') || error.code === '23505') {
      return NextResponse.json(
        { error: 'Reaction already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/messages/[messageId]/reactions - Remove reaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messageId = parseInt(params.messageId);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    await storage.removeMessageReaction(messageId, session.userId, emoji);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}

