import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { chatService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

// GET /api/chat/chats/[id]/members - Get chat members
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

    // Verify user is member
    const isMember = await chatService.isUserMember(chatId, session.userId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await chatService.getChatMembers(chatId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching chat members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat members' },
      { status: 500 }
    );
  }
}

// POST /api/chat/chats/[id]/members - Add member to chat
export async function POST(
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
    const { userId, role = 'member' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Verify requester is admin
    const isAdmin = await chatService.isUserAdmin(chatId, session.userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 });
    }

    const member = await chatService.addMember(chatId, userId, role);

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error adding chat member:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/chats/[id]/members - Remove member from chat
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

    const { searchParams } = new URL(request.url);
    const userIdToRemove = parseInt(searchParams.get('userId') || '');

    if (isNaN(userIdToRemove)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    await chatService.removeMember(chatId, userIdToRemove, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing chat member:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    );
  }
}
