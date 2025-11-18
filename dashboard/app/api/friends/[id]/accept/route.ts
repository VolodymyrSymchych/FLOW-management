import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { userService } from '@/lib/user-service';
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
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    // Try user-service first
    const result = await userService.acceptFriendRequest(requestId);

    if (result.friendship) {
      return NextResponse.json({ success: true, friendship: result.friendship });
    }

    // Fallback to local storage
    if (result.error) {
      console.warn('User service error, falling back to local storage:', result.error);
    }

    // First, verify that the friendship exists and belongs to the current user
    const pendingRequests = await storage.getPendingFriendRequests(session.userId);
    const friendshipToAccept = pendingRequests.find(req => req.id === requestId);

    if (!friendshipToAccept) {
      return NextResponse.json(
        { error: 'Friend request not found or you do not have permission to accept it' },
        { status: 404 }
      );
    }

    const friendship = await storage.acceptFriendRequest(requestId);

    if (!friendship) {
      return NextResponse.json(
        { error: 'Failed to accept friend request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, friendship });
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}
