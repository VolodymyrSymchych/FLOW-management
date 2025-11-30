import { db } from '@/server/db';
import { chats, chatMembers, chatMessages, messageReactions, users } from '@/shared/schema';
import { eq, desc, and, sql, or, inArray, lt, gt, ne } from 'drizzle-orm';
import { triggerChatEvent, PusherEvent } from './pusher-server';

// Types
type Chat = typeof chats.$inferSelect;
type InsertChat = typeof chats.$inferInsert;
type ChatMember = typeof chatMembers.$inferSelect;
type InsertChatMember = typeof chatMembers.$inferInsert;
type ChatMessage = typeof chatMessages.$inferSelect;
type InsertChatMessage = typeof chatMessages.$inferInsert;
type MessageReaction = typeof messageReactions.$inferSelect;

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
      throw new Error('Chat not found');
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
      throw new Error('Only admins can remove members');
    }

    const result = await db
      .delete(chatMembers)
      .where(and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)))
      .returning({ id: chatMembers.id });

    if (result.length === 0) {
      throw new Error('Member not found in chat');
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
      throw new Error('Only admins can update chat');
    }

    const [updated] = await db
      .update(chats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chats.id, id))
      .returning();

    if (!updated) {
      throw new Error('Chat not found');
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
      throw new Error('Only chat creator can delete chat');
    }

    await db.delete(chats).where(eq(chats.id, id));
  }
}

export class MessageService {
  private chatService = new ChatService();

  // Send a message
  async sendMessage(data: InsertChatMessage, senderId: number): Promise<ChatMessage> {
    // Verify user is member of chat
    const isMember = await this.chatService.isUserMember(data.chatId, senderId);
    if (!isMember) {
      throw new Error('You are not a member of this chat');
    }

    // Extract mentions from content (@username)
    const mentions = this.extractMentions(data.content);

    const messages = await db
      .insert(chatMessages)
      .values({
        ...data,
        senderId,
        mentions: mentions.length > 0 ? JSON.stringify(mentions) : null,
        readBy: JSON.stringify([senderId]), // Sender has read their own message
      })
      .returning() as ChatMessage[];

    const message = messages[0]!;

    // Trigger real-time event
    await triggerChatEvent(data.chatId, PusherEvent.NEW_MESSAGE, {
      message,
    });

    return message;
  }

  // Extract user mentions from message content
  private extractMentions(content: string): number[] {
    const mentionRegex = /@user:(\d+)/g;
    const mentions: number[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const userId = parseInt(match[1], 10);
      if (!mentions.includes(userId)) {
        mentions.push(userId);
      }
    }

    return mentions;
  }

  // Get messages for a chat
  async getChatMessages(chatId: number, userId: number, limit = 50, before?: number): Promise<ChatMessage[]> {
    // Verify user is member of chat
    const isMember = await this.chatService.isUserMember(chatId, userId);
    if (!isMember) {
      throw new Error('You are not a member of this chat');
    }

    const conditions = [
      eq(chatMessages.chatId, chatId),
      sql`${chatMessages.deletedAt} IS NULL`,
    ];

    if (before) {
      conditions.push(lt(chatMessages.id, before));
    }

    return await db
      .select()
      .from(chatMessages)
      .where(and(...conditions))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Get message by ID
  async getMessageById(id: number, userId: number): Promise<ChatMessage> {
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.id, id), sql`${chatMessages.deletedAt} IS NULL`))
      .limit(1);

    if (!message) {
      throw new Error('Message not found');
    }

    // Verify user is member of chat
    const isMember = await this.chatService.isUserMember(message.chatId, userId);
    if (!isMember) {
      throw new Error('You are not a member of this chat');
    }

    return message;
  }

  // Edit message
  async editMessage(id: number, userId: number, content: string): Promise<ChatMessage> {
    const message = await this.getMessageById(id, userId);

    // Only sender can edit
    if (message.senderId !== userId) {
      throw new Error('You can only edit your own messages');
    }

    const [updated] = await db
      .update(chatMessages)
      .set({
        content,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, id))
      .returning();

    // Trigger real-time event
    await triggerChatEvent(message.chatId, PusherEvent.MESSAGE_UPDATED, {
      message: updated,
    });

    return updated;
  }

  // Delete message (soft delete)
  async deleteMessage(id: number, userId: number): Promise<void> {
    const message = await this.getMessageById(id, userId);

    // Only sender or chat admin can delete
    const isAdmin = await this.chatService.isUserAdmin(message.chatId, userId);
    if (message.senderId !== userId && !isAdmin) {
      throw new Error('You can only delete your own messages or be a chat admin');
    }

    await db
      .update(chatMessages)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, id));

    // Trigger real-time event
    await triggerChatEvent(message.chatId, PusherEvent.MESSAGE_DELETED, {
      messageId: id,
    });
  }

  // Add reaction to message
  async addReaction(messageId: number, userId: number, emoji: string): Promise<MessageReaction> {
    const message = await this.getMessageById(messageId, userId);

    const [reaction] = await db
      .insert(messageReactions)
      .values({
        messageId,
        userId,
        emoji,
      })
      .returning();

    // Trigger real-time event
    await triggerChatEvent(message.chatId, PusherEvent.MESSAGE_REACTION, {
      messageId,
      userId,
      emoji,
      action: 'add',
    });

    return reaction;
  }

  // Remove reaction from message
  async removeReaction(messageId: number, userId: number, emoji: string): Promise<void> {
    const message = await this.getMessageById(messageId, userId);

    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.emoji, emoji)
        )
      );

    // Trigger real-time event
    await triggerChatEvent(message.chatId, PusherEvent.MESSAGE_REACTION, {
      messageId,
      userId,
      emoji,
      action: 'remove',
    });
  }

  // Get mentions for user
  async getMentionsForUser(userId: number, limit = 50): Promise<ChatMessage[]> {
    const userChats = await db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId));

    if (userChats.length === 0) {
      return [];
    }

    const chatIds = userChats.map(c => c.chatId);

    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          inArray(chatMessages.chatId, chatIds),
          sql`${chatMessages.mentions} IS NOT NULL`,
          sql`${chatMessages.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    // Filter messages where user is mentioned
    return messages.filter(msg => {
      try {
        const mentions = msg.mentions ? JSON.parse(msg.mentions) : [];
        return mentions.includes(userId);
      } catch {
        return false;
      }
    });
  }

  // Create task from message
  async createTaskFromMessage(
    messageId: number,
    userId: number,
    taskData: {
      title: string;
      description?: string;
      projectId?: number;
      assignee?: string;
      dueDate?: Date;
      priority?: string;
    }
  ): Promise<{ messageId: number; taskId: number }> {
    const message = await this.getMessageById(messageId, userId);

    // Check if message already has a task
    if (message.taskId) {
      throw new Error('This message already has a task associated with it');
    }

    // Call task API to create the task
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    const { task } = await response.json();
    const taskId = task.id;

    // Update message with task reference
    await db
      .update(chatMessages)
      .set({
        taskId,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, messageId));

    // Trigger real-time event
    await triggerChatEvent(message.chatId, PusherEvent.MESSAGE_UPDATED, {
      messageId,
      taskId,
      action: 'task_created',
    });

    return { messageId, taskId };
  }
}

export const chatService = new ChatService();
export const messageService = new MessageService();

