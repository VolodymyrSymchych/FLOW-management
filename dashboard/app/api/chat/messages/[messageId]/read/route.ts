import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { eq, and } from 'drizzle-orm';
import { db } from '@/server/db';
import { chatMessages, chatMembers } from '@/shared/schema';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/messages/[messageId]/read - Mark message as read
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

    // Verify user has access to the message (is member of the chat)
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId));

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user is a member of the chat
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

    // Mark as read (only if user is not the sender)
    if (message.senderId !== session.userId) {
      await db
        .update(chatMessages)
        .set({ readAt: new Date() })
        .where(eq(chatMessages.id, messageId));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}

