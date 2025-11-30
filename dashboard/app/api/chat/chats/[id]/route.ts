import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { chatService, messageService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

// GET /api/chat/chats/[id] - Get chat by ID with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatId = parseInt(params.id);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    const chat = await chatService.getChatById(chatId);
    
    // Verify user is member
    const isMember = await chatService.isUserMember(chatId, session.userId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messages = await messageService.getChatMessages(chatId, session.userId, 50);

    // Get members
    const members = await chatService.getChatMembers(chatId);

    return NextResponse.json({ chat, messages, members });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/chats/[id] - Update chat
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatId = parseInt(params.id);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    const chat = await chatService.updateChat(chatId, session.userId, { name });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/chats/[id] - Delete chat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatId = parseInt(params.id);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    await chatService.deleteChat(chatId, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
