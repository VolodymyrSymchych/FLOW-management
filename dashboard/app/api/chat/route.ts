import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';

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

      const chat = await storage.getChatById(chatIdNum, session.userId);
      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      const members = await storage.getChatMembers(chatIdNum);
      const messages = await storage.getChatMessages(chatIdNum);

      return NextResponse.json({
        chat,
        members,
        messages,
      });
    }

    // Get or create direct chat with recipient
    if (recipientId) {
      const recipientIdNum = parseInt(recipientId);
      if (isNaN(recipientIdNum)) {
        return NextResponse.json({ error: 'Invalid recipient ID' }, { status: 400 });
      }

      const chat = await storage.getOrCreateDirectChat(session.userId, recipientIdNum);
      const members = await storage.getChatMembers(chat.id);
      const messages = await storage.getChatMessages(chat.id);

      return NextResponse.json({
        chat,
        members,
        messages,
      });
    }

    // Get all user's chats
    const chats = await storage.getUserChats(session.userId);
    
    // Optimized: Batch fetch members and last messages for all chats
    const chatIds = chats.map(chat => chat.id);
    
    // Fetch all members and messages in parallel
    const [allMembers, allLastMessages] = await Promise.all([
      Promise.all(chatIds.map(id => storage.getChatMembers(id))),
      Promise.all(chatIds.map(id => storage.getChatMessages(id, 1))),
    ]);
    
    // Create maps for quick lookup
    const membersMap = new Map<number, typeof allMembers[0]>();
    const lastMessagesMap = new Map<number, typeof allLastMessages[0][0] | null>();
    
    chatIds.forEach((chatId, index) => {
      membersMap.set(chatId, allMembers[index]);
      lastMessagesMap.set(chatId, allLastMessages[index][0] || null);
    });
    
    // Enrich chats with last message and members
    const enrichedChats = chats.map(chat => ({
      ...chat,
      members: membersMap.get(chat.id) || [],
      lastMessage: lastMessagesMap.get(chat.id) || null,
    }));

    return NextResponse.json({ chats: enrichedChats });
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
    const { action, chatId, content, messageType, replyToId, recipientId, type, name, projectId, teamId, memberIds, attachmentIds } = body;

    // Create new chat
    if (action === 'create') {
      if (type === 'direct' && recipientId) {
        const chat = await storage.getOrCreateDirectChat(session.userId, recipientId);
        return NextResponse.json({ chat }, { status: 201 });
      }

      if (type === 'group' || type === 'project' || type === 'team') {
        if (!name && type === 'group') {
          return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
        }

        const chatData = {
          type,
          name: type === 'group' ? name : undefined,
          projectId: type === 'project' ? projectId : undefined,
          teamId: type === 'team' ? teamId : undefined,
          createdBy: session.userId,
        };

        const members = memberIds || [session.userId];
        if (!members.includes(session.userId)) {
          members.push(session.userId);
        }

        const chat = await storage.createGroupChat(chatData, members);
        return NextResponse.json({ chat }, { status: 201 });
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

      // Verify user is a member of the chat
      const chat = await storage.getChatById(chatId, session.userId);
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found or access denied' },
          { status: 404 }
        );
      }

      const message = await storage.createChatMessage({
        chatId,
        senderId: session.userId,
        content: content.trim(),
        messageType: messageType || 'text',
        replyToId: replyToId || undefined,
      });

      // Add attachments if provided
      if (attachmentIds && Array.isArray(attachmentIds)) {
        for (const attachmentId of attachmentIds) {
          await storage.addMessageAttachment(message.id, attachmentId);
        }
      }

      // Get full message with sender info
      const messages = await storage.getChatMessages(chatId, 1);
      const fullMessage = messages.find(m => m.id === message.id);

      return NextResponse.json(
        { message: fullMessage || message },
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
