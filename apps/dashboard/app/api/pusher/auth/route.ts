import { NextRequest, NextResponse } from 'next/server';
import { isUnauthorizedError, requireAuth } from '@/lib/auth-helper';
import { authenticatePusherChannel } from '@/lib/pusher-server';
import { chatService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ably sends authUrl requests as form-encoded, not JSON
    let socket_id: string | undefined;
    let channel_name: string | undefined;
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      socket_id = params.get('socketId') ?? params.get('socket_id') ?? undefined;
      channel_name = params.get('channelName') ?? params.get('channel_name') ?? undefined;
    } else {
      const body = await request.json();
      socket_id = body.socket_id;
      channel_name = body.channel_name;
    }

    // Verify chat membership for private channels
    if (channel_name?.startsWith('private-chat-')) {
      const chatId = parseInt(channel_name.replace('private-chat-', ''), 10);
      if (isNaN(chatId)) {
        return NextResponse.json({ error: 'Invalid channel name' }, { status: 400 });
      }
      const isMember = await chatService.isUserMember(chatId, session.userId);
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json({ error: 'Ably not configured' }, { status: 503 });
    }

    // Ably: issue a token request scoped to this user
    const tokenRequest = await authenticatePusherChannel(
      socket_id,
      channel_name,
      session.userId,
    );

    return NextResponse.json(tokenRequest);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error authenticating Pusher channel:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
