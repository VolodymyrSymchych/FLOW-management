import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { authenticatePusherChannel } from '@/lib/pusher-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Verify user has access to the channel
    if (channel_name.startsWith('private-chat-')) {
      const chatId = parseInt(channel_name.replace('private-chat-', ''));
      
      // TODO: Verify user is member of chat
      // const { chatService } = await import('@/lib/chat-service');
      // const isMember = await chatService.isUserMember(chatId, session.userId);
      // if (!isMember) {
      //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      // }
    }

    const auth = authenticatePusherChannel(
      socket_id,
      channel_name,
      session.userId,
      {
        name: `User ${session.userId}`, // TODO: Get username from database
        avatar: undefined,
      }
    );

    return NextResponse.json(auth);
  } catch (error) {
    console.error('Error authenticating Pusher channel:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

