import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { messageService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

// POST /api/chat/messages/[id]/reactions - Add reaction to message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = parseInt(params.id);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Missing emoji' }, { status: 400 });
    }

    const reaction = await messageService.addReaction(messageId, session.userId, emoji);

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/messages/[id]/reactions - Remove reaction from message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageId = parseInt(params.id);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Missing emoji' }, { status: 400 });
    }

    await messageService.removeReaction(messageId, session.userId, emoji);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
