import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../../server/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const friendshipId = parseInt(id);

    // First, verify that the friendship exists and belongs to the current user
    const pendingRequests = await storage.getPendingFriendRequests(session.userId);
    const friendshipToReject = pendingRequests.find(req => req.id === friendshipId);

    if (!friendshipToReject) {
      return NextResponse.json(
        { error: 'Friend request not found or you do not have permission to reject it' },
        { status: 404 }
      );
    }

    await storage.rejectFriendRequest(friendshipId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reject friend request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject friend request' },
      { status: 500 }
    );
  }
}
