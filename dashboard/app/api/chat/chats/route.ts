import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { chatService } from '@/lib/chat-service';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';

export const dynamic = 'force-dynamic';

// GET /api/chat/chats - Get user's chats
export async function GET(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cache chats for 60 seconds (real-time data, short TTL)
    // No timestamp validation for chat as it's frequently updated
    const chats = await cachedWithValidation(
      CacheKeys.chatsByUser(session.userId),
      async () => await chatService.getUserChats(session.userId),
      {
        ttl: 60, // 60 seconds - short TTL for real-time data
        validate: false, // No validation - rely on TTL only
      }
    );

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chat/chats - Create a new chat
export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, name, projectId, teamId, memberIds } = body;

    let chat;

    if (type === 'direct' && memberIds && memberIds.length === 1) {
      // Create direct chat
      chat = await chatService.findOrCreateDirectChat(session.userId, memberIds[0]);
    } else {
      // Create group or project chat
      chat = await chatService.createChat(
        {
          type,
          name,
          projectId,
          teamId,
        },
        session.userId
      );

      // Add members if provided
      if (memberIds && memberIds.length > 0) {
        await Promise.all(
          memberIds.map((memberId: number) =>
            chatService.addMember(chat.id, memberId, 'member')
          )
        );
      }
    }

    // Invalidate caches after creating chat
    await invalidateOnUpdate('chat', chat.id, session.userId);

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create chat' },
      { status: 500 }
    );
  }
}

