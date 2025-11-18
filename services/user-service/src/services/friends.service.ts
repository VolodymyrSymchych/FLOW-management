import { db, friendships, users } from '../db';
import { eq, and, or } from 'drizzle-orm';
import { logger } from '@project-scope-analyzer/shared';

export interface Friendship {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendshipWithUser extends Friendship {
  friend: {
    id: number;
    username: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending';
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: number;
    username: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export class FriendsService {
  /**
   * Get all friends for a user (accepted friendships)
   */
  async getFriends(userId: number): Promise<FriendshipWithUser[]> {
    try {
      const userFriendships = await db.query.friendships.findMany({
        where: and(
          eq(friendships.status, 'accepted'),
          or(
            eq(friendships.senderId, userId),
            eq(friendships.receiverId, userId)
          )
        ),
        with: {
          sender: true,
          receiver: true,
        },
      });

      return userFriendships.map(friendship => {
        const friend = friendship.senderId === userId ? friendship.receiver : friendship.sender;
        return {
          id: friendship.id,
          senderId: friendship.senderId,
          receiverId: friendship.receiverId,
          status: friendship.status as 'accepted',
          createdAt: friendship.createdAt,
          updatedAt: friendship.updatedAt,
          friend: {
            id: friend.id,
            username: friend.username,
            fullName: friend.fullName,
            email: friend.email,
            avatarUrl: friend.avatarUrl,
          },
        };
      });
    } catch (error) {
      logger.error('Error getting friends', { error, userId });
      throw error;
    }
  }

  /**
   * Get pending friend requests for a user
   */
  async getPendingFriendRequests(userId: number): Promise<FriendRequest[]> {
    try {
      const pendingRequests = await db.query.friendships.findMany({
        where: and(
          eq(friendships.receiverId, userId),
          eq(friendships.status, 'pending')
        ),
        with: {
          sender: true,
        },
      });

      return pendingRequests.map(request => ({
        id: request.id,
        senderId: request.senderId,
        receiverId: request.receiverId,
        status: 'pending' as const,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        sender: {
          id: request.sender.id,
          username: request.sender.username,
          fullName: request.sender.fullName,
          email: request.sender.email,
          avatarUrl: request.sender.avatarUrl,
        },
      }));
    } catch (error) {
      logger.error('Error getting pending friend requests', { error, userId });
      throw error;
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId: number, receiverId: number): Promise<Friendship> {
    try {
      if (senderId === receiverId) {
        throw new Error('Cannot send friend request to yourself');
      }

      // Check if friendship already exists
      const existing = await db.query.friendships.findFirst({
        where: or(
          and(
            eq(friendships.senderId, senderId),
            eq(friendships.receiverId, receiverId)
          ),
          and(
            eq(friendships.senderId, receiverId),
            eq(friendships.receiverId, senderId)
          )
        ),
      });

      if (existing) {
        if (existing.status === 'accepted') {
          throw new Error('Users are already friends');
        }
        if (existing.status === 'pending') {
          throw new Error('Friend request already sent');
        }
        if (existing.status === 'blocked') {
          throw new Error('Cannot send friend request to blocked user');
        }
        // If rejected, update to pending
        const [updated] = await db
          .update(friendships)
          .set({
            senderId,
            receiverId,
            status: 'pending',
            updatedAt: new Date(),
          })
          .where(eq(friendships.id, existing.id))
          .returning();

        return updated! as Friendship;
      }

      // Create new friendship
      const [newFriendship] = await db
        .insert(friendships)
        .values({
          senderId,
          receiverId,
          status: 'pending',
        })
        .returning();

      return newFriendship! as Friendship;
    } catch (error) {
      logger.error('Error sending friend request', { error, senderId, receiverId });
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: number, receiverId: number): Promise<Friendship> {
    try {
      const request = await db.query.friendships.findFirst({
        where: and(
          eq(friendships.id, requestId),
          eq(friendships.receiverId, receiverId),
          eq(friendships.status, 'pending')
        ),
      });

      if (!request) {
        throw new Error('Friend request not found');
      }

      const result = await db
        .update(friendships)
        .set({
          status: 'accepted' as const,
          updatedAt: new Date(),
        })
        .where(eq(friendships.id, requestId))
        .returning();

      return result[0] as Friendship;
    } catch (error) {
      logger.error('Error accepting friend request', { error, requestId, receiverId });
      throw error;
    }
  }

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: number, receiverId: number): Promise<void> {
    try {
      const request = await db.query.friendships.findFirst({
        where: and(
          eq(friendships.id, requestId),
          eq(friendships.receiverId, receiverId),
          eq(friendships.status, 'pending')
        ),
      });

      if (!request) {
        throw new Error('Friend request not found');
      }

      await db
        .update(friendships)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(friendships.id, requestId));
    } catch (error) {
      logger.error('Error rejecting friend request', { error, requestId, receiverId });
      throw error;
    }
  }

  /**
   * Remove a friendship (unfriend)
   */
  async removeFriendship(friendshipId: number, userId: number): Promise<void> {
    try {
      const friendship = await db.query.friendships.findFirst({
        where: and(
          eq(friendships.id, friendshipId),
          eq(friendships.status, 'accepted'),
          or(
            eq(friendships.senderId, userId),
            eq(friendships.receiverId, userId)
          )
        ),
      });

      if (!friendship) {
        throw new Error('Friendship not found');
      }

      await db.delete(friendships).where(eq(friendships.id, friendshipId));
    } catch (error) {
      logger.error('Error removing friendship', { error, friendshipId, userId });
      throw error;
    }
  }
}

export const friendsService = new FriendsService();

