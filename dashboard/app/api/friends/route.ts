import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../server/storage';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const friendships = await storage.getFriends(session.userId);
    const pendingRequests = await storage.getPendingFriendRequests(session.userId);

    // Optimized: Batch fetch all friend users at once
    const friendIds = friendships.map(friendship => 
      friendship.senderId === session.userId 
        ? friendship.receiverId 
        : friendship.senderId
    );
    
    const friendUsers = await Promise.all(
      friendIds.map(id => storage.getUser(id))
    );
    
    const usersMap = new Map<number, any>();
    friendUsers.forEach((user, index) => {
      if (user) {
        usersMap.set(friendIds[index], {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
        });
      }
    });
    
    // Map friendships with friend details
    const friendsWithDetails = friendships.map(friendship => {
      const friendId = friendship.senderId === session.userId 
        ? friendship.receiverId 
        : friendship.senderId;
      return {
        ...friendship,
        friend: usersMap.get(friendId) || null,
      };
    });

    // Fetch sender information for pending requests
    const senderIds = pendingRequests.map(request => request.senderId);
    const senderUsers = await Promise.all(
      senderIds.map(id => storage.getUser(id))
    );
    
    const senderUsersMap = new Map<number, any>();
    senderUsers.forEach((user, index) => {
      if (user) {
        senderUsersMap.set(senderIds[index], {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        });
      }
    });
    
    // Map pending requests with sender details
    const pendingRequestsWithDetails = pendingRequests.map(request => {
      const sender = senderUsersMap.get(request.senderId);
      return {
        ...request,
        sender: sender || {
          id: request.senderId,
          username: 'Unknown',
          email: '',
          fullName: null,
          avatarUrl: null,
        },
      };
    });

    return NextResponse.json({ friends: friendsWithDetails, pendingRequests: pendingRequestsWithDetails });
  } catch (error: any) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get friends' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverEmail, emailOrUsername } = body;
    const searchValue = receiverEmail || emailOrUsername;

    if (!searchValue) {
      return NextResponse.json(
        { error: 'Email or username is required' },
        { status: 400 }
      );
    }

    // Try to find user by email first, then by username
    let receiver = await storage.getUserByEmail(searchValue);
    if (!receiver) {
      receiver = await storage.getUserByUsername(searchValue);
    }
    if (!receiver) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (receiver.id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    const friendship = await storage.sendFriendRequest(session.userId, receiver.id);

    return NextResponse.json({ success: true, friendship });
  } catch (error: any) {
    console.error('Send friend request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
