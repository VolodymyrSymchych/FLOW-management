import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/[chatId] - Get chat details and messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const chatId = parseInt(params.chatId);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    const chat = await storage.getChatById(chatId, session.userId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const beforeId = searchParams.get('beforeId') ? parseInt(searchParams.get('beforeId')!) : undefined;

    const members = await storage.getChatMembers(chatId);
    const messages = await storage.getChatMessages(chatId, limit, beforeId);

    // Update last read
    await storage.updateLastRead(chatId, session.userId);

    return NextResponse.json({
      chat,
      members,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/[chatId] - Leave or delete chat
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const chatId = parseInt(params.chatId);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    const chat = await storage.getChatById(chatId, session.userId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Remove user from chat
    await storage.removeChatMember(chatId, session.userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error leaving chat:', error);
    return NextResponse.json(
      { error: 'Failed to leave chat' },
      { status: 500 }
    );
  }
}

