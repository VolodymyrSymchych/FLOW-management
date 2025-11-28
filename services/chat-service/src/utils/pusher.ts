import Pusher from 'pusher';
import { config } from '../config';
import { logger } from '@project-scope-analyzer/shared';

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    if (!config.pusher.appId || !config.pusher.key || !config.pusher.secret) {
      logger.warn('Pusher credentials not configured. Real-time features will not work.');
      // Return a mock instance for development
      pusherInstance = {
        trigger: async () => {
          logger.debug('Mock Pusher trigger called (Pusher not configured)');
        },
      } as any;
      return pusherInstance;
    }

    pusherInstance = new Pusher({
      appId: config.pusher.appId,
      key: config.pusher.key,
      secret: config.pusher.secret,
      cluster: config.pusher.cluster,
      useTLS: true,
    });

    logger.info('Pusher initialized', { cluster: config.pusher.cluster });
  }

  return pusherInstance;
}

// Event types for type safety
export enum PusherEvent {
  NEW_MESSAGE = 'new-message',
  MESSAGE_UPDATED = 'message-updated',
  MESSAGE_DELETED = 'message-deleted',
  MESSAGE_REACTION = 'message-reaction',
  USER_TYPING = 'user-typing',
  USER_JOINED = 'user-joined',
  USER_LEFT = 'user-left',
  CHAT_UPDATED = 'chat-updated',
}

// Channel naming conventions
export function getChatChannel(chatId: number): string {
  return `private-chat-${chatId}`;
}

export function getUserPresenceChannel(userId: number): string {
  return `presence-user-${userId}`;
}

// Trigger real-time events
export async function triggerChatEvent(
  chatId: number,
  event: PusherEvent,
  data: any
): Promise<void> {
  try {
    const pusher = getPusher();
    const channel = getChatChannel(chatId);

    await pusher.trigger(channel, event, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Pusher event triggered', { channel, event, chatId });
  } catch (error) {
    logger.error('Failed to trigger Pusher event', { error, chatId, event });
    // Don't throw - real-time is not critical for operation
  }
}

// Pusher auth endpoint helper
export function authenticatePusherChannel(
  socketId: string,
  channelName: string,
  userId: number,
  userInfo?: { name: string; avatar?: string }
) {
  const pusher = getPusher();

  // For presence channels
  if (channelName.startsWith('presence-')) {
    return pusher.authorizeChannel(socketId, channelName, {
      user_id: userId.toString(),
      user_info: userInfo || { name: `User ${userId}` },
    });
  }

  // For private channels
  return pusher.authorizeChannel(socketId, channelName);
}
