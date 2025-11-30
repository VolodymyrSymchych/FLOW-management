import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/[chatId]/messages - Get messages for a chat
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

    // Verify user is a member
    const chat = await storage.getChatById(chatId, session.userId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const beforeId = searchParams.get('beforeId') ? parseInt(searchParams.get('beforeId')!) : undefined;

    // Cache messages for 30 seconds (real-time data, very short TTL)
    // No validation for messages as they change frequently
    const messages = await cachedWithValidation(
      CacheKeys.chatMessages(chatId),
      async () => await storage.getChatMessages(chatId, limit, beforeId),
      {
        ttl: 30, // 30 seconds - very short TTL for real-time messages
        validate: false, // No validation - rely on TTL only
      }
    );

    // Update last read
    await storage.updateLastRead(chatId, session.userId);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/[chatId]/messages - Send a message
 */
export async function POST(
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

    // Verify user is a member
    const chat = await storage.getChatById(chatId, session.userId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, messageType, replyToId, attachmentIds } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
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
    const user = await storage.getUser(message.senderId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 500 }
      );
    }

    const fullMessage = {
      ...message,
      sender: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      reactions: [],
      attachments: [],
    };

    // Invalidate chat messages cache after sending message
    await invalidateOnUpdate('chat', chatId, session.userId);

    return NextResponse.json(
      { message: fullMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

