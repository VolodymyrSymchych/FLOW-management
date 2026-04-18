import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat - Get user's chats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const recipientId = searchParams.get('recipientId');

    // Get specific chat
    if (chatId) {
      const chatIdNum = parseInt(chatId);
      if (isNaN(chatIdNum)) {
        return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
      }

      const result = await chatService.getChatById(chatIdNum);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }

      const membersResult = await chatService.getChatMembers(chatIdNum);
      const messagesResult = await chatService.getChatMessages(chatIdNum);

      return NextResponse.json({
        chat: result.chat,
        members: membersResult.members || [],
        messages: messagesResult.messages || [],
      });
    }

    // Get or create direct chat with recipient
    if (recipientId) {
      const recipientIdNum = parseInt(recipientId);
      if (isNaN(recipientIdNum)) {
        return NextResponse.json({ error: 'Invalid recipient ID' }, { status: 400 });
      }

      const result = await chatService.findOrCreateDirectChat(session.userId, recipientIdNum);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      const membersResult = await chatService.getChatMembers(result.chat!.id);
      const messagesResult = await chatService.getChatMessages(result.chat!.id);

      return NextResponse.json({
        chat: result.chat,
        members: membersResult.members || [],
        messages: messagesResult.messages || [],
      });
    }

    // Get all user's chats
    const result = await chatService.getUserChats();
    if (result.error) {
      console.error('Chat service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ chats: result.chats || [] });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat - Create a new chat or send a message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, chatId, content, messageType, replyToId, recipientId, type, name, projectId, teamId } = body;

    // Create new chat
    if (action === 'create') {
      if (type === 'direct' && recipientId) {
        const result = await chatService.findOrCreateDirectChat(session.userId, recipientId);
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({ chat: result.chat }, { status: 201 });
      }

      if (type === 'group' || type === 'project' || type === 'team') {
        if (!name && type === 'group') {
          return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
        }

        const result = await chatService.createChat({
          name: type === 'group' ? name : undefined,
          type,
          projectId: type === 'project' ? projectId : undefined,
          teamId: type === 'team' ? teamId : undefined,
        });

        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ chat: result.chat }, { status: 201 });
      }

      return NextResponse.json({ error: 'Invalid chat type' }, { status: 400 });
    }

    // Send message
    if (action === 'message' || !action) {
      if (!chatId || !content) {
        return NextResponse.json(
          { error: 'Chat ID and content are required' },
          { status: 400 }
        );
      }

      const result = await chatService.sendMessage({
        chatId,
        content: content.trim(),
        messageType: messageType || 'text',
        replyToId: replyToId || undefined,
      });

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(
        { message: result.message },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in chat POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
