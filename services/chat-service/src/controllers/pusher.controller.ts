import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { authenticatePusherChannel } from '../utils/pusher';
import { chatService } from '../services/chat.service';
import { ForbiddenError, BadRequestError } from '@project-scope-analyzer/shared';
import { z } from 'zod';

const pusherAuthSchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
});

export class PusherController {
  // Pusher auth endpoint
  async auth(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { socket_id, channel_name } = pusherAuthSchema.parse(req.body);

    // Verify user has access to the channel
    if (channel_name.startsWith('private-chat-')) {
      const chatId = parseInt(channel_name.replace('private-chat-', ''));

      if (isNaN(chatId)) {
        throw new BadRequestError('Invalid channel name');
      }

      // Check if user is member of this chat
      const isMember = await chatService.isUserMember(chatId, user.userId);
      if (!isMember) {
        throw new ForbiddenError('You are not a member of this chat');
      }
    }

    const auth = authenticatePusherChannel(socket_id, channel_name, user.userId, {
      name: user.username,
    });

    res.json(auth);
  }
}

export const pusherController = new PusherController();
