import { Response } from 'express';
import { messageService } from '../services/message.service';
import { AuthenticatedRequest } from '../types/express';
import { z } from 'zod';
import { ValidationError } from '@project-scope-analyzer/shared';

// Validation schemas
const sendMessageSchema = z.object({
  chatId: z.number(),
  content: z.string().min(1),
  messageType: z.enum(['text', 'file', 'system']).default('text'),
  replyToId: z.number().optional(),
  metadata: z.string().optional(),
});

const editMessageSchema = z.object({
  content: z.string().min(1),
});

const addReactionSchema = z.object({
  emoji: z.string().length(1).or(z.string().min(1).max(10)),
});

const createTaskFromMessageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.number().optional(),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export class MessageController {
  // Send message
  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const validated = sendMessageSchema.parse(req.body);

    const message = await messageService.sendMessage(validated, userId);

    res.status(201).json({ message });
  }

  // Get chat messages
  async getChatMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const chatId = parseInt(req.params.chatId);
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before ? parseInt(req.query.before as string) : undefined;

    if (isNaN(chatId)) {
      throw new ValidationError('Invalid chat ID');
    }

    const messages = await messageService.getChatMessages(chatId, userId, limit, before);

    res.json({ messages, limit });
  }

  // Get message by ID
  async getMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid message ID');
    }

    const message = await messageService.getMessageById(id, userId);

    res.json({ message });
  }

  // Edit message
  async editMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);
    const { content } = editMessageSchema.parse(req.body);

    if (isNaN(id)) {
      throw new ValidationError('Invalid message ID');
    }

    const message = await messageService.editMessage(id, userId, content);

    res.json({ message });
  }

  // Delete message
  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid message ID');
    }

    await messageService.deleteMessage(id, userId);

    res.json({ message: 'Message deleted successfully' });
  }

  // Mark message as read
  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid message ID');
    }

    await messageService.markAsRead(id, userId);

    res.json({ message: 'Message marked as read' });
  }

  // Mark chat as read
  async markChatAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const chatId = parseInt(req.params.chatId);

    if (isNaN(chatId)) {
      throw new ValidationError('Invalid chat ID');
    }

    await messageService.markChatAsRead(chatId, userId);

    res.json({ message: 'Chat marked as read' });
  }

  // Get unread count
  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const chatId = parseInt(req.params.chatId);

    if (isNaN(chatId)) {
      throw new ValidationError('Invalid chat ID');
    }

    const count = await messageService.getUnreadCount(chatId, userId);

    res.json({ count });
  }

  // Add reaction
  async addReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const messageId = parseInt(req.params.id);
    const { emoji } = addReactionSchema.parse(req.body);

    if (isNaN(messageId)) {
      throw new ValidationError('Invalid message ID');
    }

    const reaction = await messageService.addReaction(messageId, userId, emoji);

    res.status(201).json({ reaction });
  }

  // Remove reaction
  async removeReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const messageId = parseInt(req.params.id);
    const emoji = req.params.emoji;

    if (isNaN(messageId)) {
      throw new ValidationError('Invalid message ID');
    }

    await messageService.removeReaction(messageId, userId, emoji);

    res.json({ message: 'Reaction removed successfully' });
  }

  // Get message reactions
  async getMessageReactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const messageId = parseInt(req.params.id);

    if (isNaN(messageId)) {
      throw new ValidationError('Invalid message ID');
    }

    const reactions = await messageService.getMessageReactions(messageId);

    res.json({ reactions });
  }

  // Create task from message
  async createTaskFromMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const messageId = parseInt(req.params.id);
    const validated = createTaskFromMessageSchema.parse(req.body);

    if (isNaN(messageId)) {
      throw new ValidationError('Invalid message ID');
    }

    const taskData = {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    };

    const result = await messageService.createTaskFromMessage(messageId, userId, taskData);

    res.status(201).json(result);
  }

  // Get mentions for user
  async getMentions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await messageService.getMentionsForUser(userId, limit);

    res.json({ messages, count: messages.length });
  }
}

export const messageController = new MessageController();
