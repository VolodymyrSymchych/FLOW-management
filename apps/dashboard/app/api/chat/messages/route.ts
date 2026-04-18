import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { messageService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

// POST /api/chat/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, content, replyToId, messageType = 'text' } = body;

    if (!chatId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await messageService.sendMessage(
      {
        chatId,
        content,
        replyToId,
        messageType,
        senderId: session.userId,
      },
      session.userId
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}

