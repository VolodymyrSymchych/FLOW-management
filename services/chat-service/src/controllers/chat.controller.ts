import { Response } from 'express';
import { chatService } from '../services/chat.service';
import { AuthenticatedRequest } from '../types/express';
import { z } from 'zod';
import { BadRequestError } from '@project-scope-analyzer/shared';

// Validation schemas
const createChatSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['direct', 'group', 'project', 'team']),
  projectId: z.number().optional(),
  teamId: z.number().optional(),
  memberIds: z.array(z.number()).optional(),
});

const updateChatSchema = z.object({
  name: z.string().min(1).max(255),
});

const addMemberSchema = z.object({
  userId: z.number(),
  role: z.enum(['admin', 'member']).default('member'),
});

const findDirectChatSchema = z.object({
  userId: z.number(),
});

export class ChatController {
  // Create chat
  async createChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const validated = createChatSchema.parse(req.body);

    const chat = await chatService.createChat(validated, userId);

    // Add additional members if provided
    if (validated.memberIds && validated.memberIds.length > 0) {
      await Promise.all(
        validated.memberIds.map(memberId =>
          chatService.addMember(chat.id, memberId, 'member')
        )
      );
    }

    res.status(201).json({ chat });
  }

  // Get chat by ID
  async getChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid chat ID');
    }

    const chat = await chatService.getChatById(id);

    // Verify user is member
    const isMember = await chatService.isUserMember(id, userId);
    if (!isMember) {
      throw new BadRequestError('You are not a member of this chat');
    }

    res.json({ chat });
  }

  // Get user's chats
  async getUserChats(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const chats = await chatService.getUserChats(userId);

    res.json({ chats });
  }

  // Get project chats
  async getProjectChats(req: AuthenticatedRequest, res: Response) {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      throw new BadRequestError('Invalid project ID');
    }

    const chats = await chatService.getProjectChats(projectId);

    res.json({ chats });
  }

  // Get team chats
  async getTeamChats(req: AuthenticatedRequest, res: Response) {
    const teamId = parseInt(req.params.teamId);

    if (isNaN(teamId)) {
      throw new BadRequestError('Invalid team ID');
    }

    const chats = await chatService.getTeamChats(teamId);

    res.json({ chats });
  }

  // Find or create direct chat
  async findOrCreateDirectChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const { userId: otherUserId } = findDirectChatSchema.parse(req.body);

    const chat = await chatService.findOrCreateDirectChat(userId, otherUserId);

    res.json({ chat });
  }

  // Get chat members
  async getChatMembers(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const chatId = parseInt(req.params.id);

    if (isNaN(chatId)) {
      throw new BadRequestError('Invalid chat ID');
    }

    // Verify user is member
    const isMember = await chatService.isUserMember(chatId, userId);
    if (!isMember) {
      throw new BadRequestError('You are not a member of this chat');
    }

    const members = await chatService.getChatMembers(chatId);

    res.json({ members });
  }

  // Add member to chat
  async addMember(req: AuthenticatedRequest, res: Response) {
    const requesterId = req.user!.userId;
    const chatId = parseInt(req.params.id);
    const validated = addMemberSchema.parse(req.body);

    if (isNaN(chatId)) {
      throw new BadRequestError('Invalid chat ID');
    }

    const member = await chatService.addMember(chatId, validated.userId, validated.role);

    res.status(201).json({ member });
  }

  // Remove member from chat
  async removeMember(req: AuthenticatedRequest, res: Response) {
    const requesterId = req.user!.userId;
    const chatId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    if (isNaN(chatId) || isNaN(userId)) {
      throw new BadRequestError('Invalid chat or user ID');
    }

    await chatService.removeMember(chatId, userId, requesterId);

    res.json({ message: 'Member removed successfully' });
  }

  // Update chat
  async updateChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);
    const validated = updateChatSchema.parse(req.body);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid chat ID');
    }

    const chat = await chatService.updateChat(id, userId, validated);

    res.json({ chat });
  }

  // Delete chat
  async deleteChat(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid chat ID');
    }

    await chatService.deleteChat(id, userId);

    res.json({ message: 'Chat deleted successfully' });
  }
}

export const chatController = new ChatController();
