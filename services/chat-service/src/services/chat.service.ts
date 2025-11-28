import { db, chats, chatMembers, chatMessages, messageReactions, Chat, InsertChat, ChatMember, InsertChatMember, ChatMessage, InsertChatMessage } from '../db';
import { eq, desc, and, sql, or, inArray } from 'drizzle-orm';
import { NotFoundError, ValidationError, ForbiddenError } from '@project-scope-analyzer/shared';
import { triggerChatEvent, PusherEvent } from '../utils/pusher';

export class ChatService {
  // Create a new chat
  async createChat(data: Omit<InsertChat, 'createdBy'>, creatorId: number): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values({
        ...data,
        createdBy: creatorId,
      })
      .returning();

    // Add creator as admin member
    await this.addMember(chat.id, creatorId, 'admin');

    return chat;
  }

  // Get chat by ID
  async getChatById(id: number): Promise<Chat> {
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, id))
      .limit(1);

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    return chat;
  }

  // Get user's chats
  async getUserChats(userId: number): Promise<Chat[]> {
    const userChatMemberships = await db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId));

    if (userChatMemberships.length === 0) {
      return [];
    }

    const chatIds = userChatMemberships.map(m => m.chatId);

    return await db
      .select()
      .from(chats)
      .where(inArray(chats.id, chatIds))
      .orderBy(desc(chats.updatedAt));
  }

  // Get project chats
  async getProjectChats(projectId: number): Promise<Chat[]> {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.projectId, projectId))
      .orderBy(desc(chats.createdAt));
  }

  // Get team chats
  async getTeamChats(teamId: number): Promise<Chat[]> {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.teamId, teamId))
      .orderBy(desc(chats.createdAt));
  }

  // Find or create direct chat between two users
  async findOrCreateDirectChat(userId1: number, userId2: number): Promise<Chat> {
    // Find existing direct chat between these users
    const user1Chats = await db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId1));

    const user2Chats = await db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId2));

    const commonChatIds = user1Chats
      .filter(c1 => user2Chats.some(c2 => c2.chatId === c1.chatId))
      .map(c => c.chatId);

    if (commonChatIds.length > 0) {
      const [existingChat] = await db
        .select()
        .from(chats)
        .where(and(eq(chats.type, 'direct'), inArray(chats.id, commonChatIds)))
        .limit(1);

      if (existingChat) {
        return existingChat;
      }
    }

    // Create new direct chat
    const [chat] = await db
      .insert(chats)
      .values({
        type: 'direct',
        createdBy: userId1,
      })
      .returning();

    // Add both users as members
    await Promise.all([
      this.addMember(chat.id, userId1, 'member'),
      this.addMember(chat.id, userId2, 'member'),
    ]);

    return chat;
  }

  // Add member to chat
  async addMember(chatId: number, userId: number, role: 'admin' | 'member' = 'member'): Promise<ChatMember> {
    const [member] = await db
      .insert(chatMembers)
      .values({
        chatId,
        userId,
        role,
      })
      .returning();

    // Trigger real-time event
    await triggerChatEvent(chatId, PusherEvent.USER_JOINED, {
      userId,
      role,
    });

    return member;
  }

  // Remove member from chat
  async removeMember(chatId: number, userId: number, requesterId: number): Promise<void> {
    // Check if requester is admin
    const isAdmin = await this.isUserAdmin(chatId, requesterId);
    if (!isAdmin && requesterId !== userId) {
      throw new ForbiddenError('Only admins can remove members');
    }

    const result = await db
      .delete(chatMembers)
      .where(and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)))
      .returning({ id: chatMembers.id });

    if (result.length === 0) {
      throw new NotFoundError('Member not found in chat');
    }

    // Trigger real-time event
    await triggerChatEvent(chatId, PusherEvent.USER_LEFT, {
      userId,
    });
  }

  // Get chat members
  async getChatMembers(chatId: number): Promise<ChatMember[]> {
    return await db
      .select()
      .from(chatMembers)
      .where(eq(chatMembers.chatId, chatId))
      .orderBy(chatMembers.joinedAt);
  }

  // Check if user is member of chat
  async isUserMember(chatId: number, userId: number): Promise<boolean> {
    const [member] = await db
      .select()
      .from(chatMembers)
      .where(and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)))
      .limit(1);

    return !!member;
  }

  // Check if user is admin of chat
  async isUserAdmin(chatId: number, userId: number): Promise<boolean> {
    const [member] = await db
      .select()
      .from(chatMembers)
      .where(and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId), eq(chatMembers.role, 'admin')))
      .limit(1);

    return !!member;
  }

  // Update chat
  async updateChat(id: number, userId: number, updates: Partial<Pick<Chat, 'name'>>): Promise<Chat> {
    // Check if user is admin
    const isAdmin = await this.isUserAdmin(id, userId);
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can update chat');
    }

    const [updated] = await db
      .update(chats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chats.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError('Chat not found');
    }

    // Trigger real-time event
    await triggerChatEvent(id, PusherEvent.CHAT_UPDATED, {
      chatId: id,
      updates,
    });

    return updated;
  }

  // Delete chat
  async deleteChat(id: number, userId: number): Promise<void> {
    const chat = await this.getChatById(id);

    // Only creator can delete chat
    if (chat.createdBy !== userId) {
      throw new ForbiddenError('Only chat creator can delete chat');
    }

    await db.delete(chats).where(eq(chats.id, id));
  }
}

export const chatService = new ChatService();
