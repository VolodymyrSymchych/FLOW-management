import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { messageService } from '@/lib/chat-service';

export const dynamic = 'force-dynamic';

// GET /api/chat/messages/mentions - Get mentions for current user
export async function GET(request: NextRequest) {
  try {
    const { session } = await requireAuth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const mentions = await messageService.getMentionsForUser(session.userId, limit);

    return NextResponse.json({ mentions });
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentions' },
      { status: 500 }
    );
  }
}
