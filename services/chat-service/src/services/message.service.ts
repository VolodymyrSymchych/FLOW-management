import { db, chatMessages, messageReactions, chatMembers, ChatMessage, InsertChatMessage, MessageReaction, InsertMessageReaction } from '../db';
import { eq, desc, and, sql, lt, gt, ne } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '@project-scope-analyzer/shared';
import { chatService } from './chat.service';
import { triggerChatEvent, PusherEvent } from '../utils/pusher';
import { sendPushToUsers, getUserBeamsId } from '../utils/beams';

export class MessageService {
  // Send a message
  async sendMessage(data: InsertChatMessage, senderId: number): Promise<ChatMessage> {
    // Verify user is member of chat
    const isMember = await chatService.isUserMember(data.chatId, senderId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this chat');
    }

    const [message] = await db
      .insert(chatMessages)
      .values({
        ...data,
        senderId,
        readBy: JSON.stringify([senderId]), // Sender has read their own message
      })
      .returning();

    // Update chat's updatedAt timestamp
    await db
      .update(chatMessages)
      .set({ updatedAt: new Date() })
      .where(eq(chatMessages.chatId, data.chatId));

    // Trigger real-time event
    await triggerChatEvent(data.chatId, PusherEvent.NEW_MESSAGE, {
      message,
    });

    // Send push notifications to offline chat members
    await this.sendNewMessagePushNotification(message, senderId);

    return message;
  }

  // Get messages for a chat
  async getChatMessages(chatId: number, userId: number, limit = 50, before?: number): Promise<ChatMessage[]> {
    // Verify user is member of chat
    const isMember = await chatService.isUserMember(chatId, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this chat');
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
      throw new NotFoundError('Message not found');
    }

    // Verify user is member of chat
    const isMember = await chatService.isUserMember(message.chatId, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this chat');
    }

    return message;
  }

  // Edit message
  async editMessage(id: number, userId: number, content: string): Promise<ChatMessage> {
    const message = await this.getMessageById(id, userId);

    // Only sender can edit
    if (message.senderId !== userId) {
      throw new ForbiddenError('You can only edit your own messages');
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
    const isAdmin = await chatService.isUserAdmin(message.chatId, userId);
    if (message.senderId !== userId && !isAdmin) {
      throw new ForbiddenError('You can only delete your own messages or be a chat admin');
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

  // Mark message as read
  async markAsRead(messageId: number, userId: number): Promise<void> {
    const message = await this.getMessageById(messageId, userId);

    let readBy: number[] = [];
    try {
      readBy = message.readBy ? JSON.parse(message.readBy) : [];
    } catch (e) {
      readBy = [];
    }

    if (!readBy.includes(userId)) {
      readBy.push(userId);

      await db
        .update(chatMessages)
        .set({ readBy: JSON.stringify(readBy) })
        .where(eq(chatMessages.id, messageId));
    }
  }

  // Mark all messages in chat as read
  async markChatAsRead(chatId: number, userId: number): Promise<void> {
    const isMember = await chatService.isUserMember(chatId, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this chat');
    }

    // Update last read timestamp for user in chat members
    await db
      .update(chatMessages)
      .set({ lastReadAt: new Date() })
      .where(and(eq(chatMessages.chatId, chatId), eq(chatMessages.senderId, userId)));
  }

  // Get unread message count
  async getUnreadCount(chatId: number, userId: number): Promise<number> {
    const isMember = await chatService.isUserMember(chatId, userId);
    if (!isMember) {
      return 0;
    }

    // Get last read timestamp
    const [member] = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.chatId, chatId), eq(chatMessages.senderId, userId)))
      .limit(1);

    const lastReadAt = member?.lastReadAt || new Date(0);

    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.chatId, chatId),
          gt(chatMessages.createdAt, lastReadAt),
          sql`${chatMessages.senderId} != ${userId}`,
          sql`${chatMessages.deletedAt} IS NULL`
        )
      );

    return result?.count || 0;
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

  // Get message reactions
  async getMessageReactions(messageId: number): Promise<MessageReaction[]> {
    return await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, messageId))
      .orderBy(messageReactions.createdAt);
  }

  // Send push notification for new message
  private async sendNewMessagePushNotification(message: ChatMessage, senderId: number): Promise<void> {
    try {
      // Get all chat members except the sender
      const members = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(and(
          eq(chatMembers.chatId, message.chatId),
          ne(chatMembers.userId, senderId)
        ));

      if (members.length === 0) {
        return;
      }

      // Convert user IDs to Beams format
      const userIds = members.map(m => getUserBeamsId(m.userId));

      // Get sender name (you might want to join with users table)
      const senderName = `User ${senderId}`; // TODO: Get from users table

      // Send push notification
      await sendPushToUsers(userIds, {
        title: senderName,
        body: message.content.substring(0, 100), // Truncate long messages
        data: {
          chatId: message.chatId,
          messageId: message.id,
          type: 'new_message',
        },
        deep_link: `/chats/${message.chatId}`,
      });
    } catch (error) {
      // Log error but don't throw - push notifications are not critical
      console.error('Failed to send push notification:', error);
    }
  }
}

export const messageService = new MessageService();
