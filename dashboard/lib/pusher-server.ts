import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (pusherInstance) {
    return pusherInstance;
  }

  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    console.warn('Pusher credentials not configured. Real-time features will not work.');
    // Return a mock instance for development
    pusherInstance = {
      trigger: async () => {
        console.log('Mock Pusher trigger called (Pusher not configured)');
      },
      authorizeChannel: () => ({}),
    } as any;
    return pusherInstance;
  }

  pusherInstance = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'eu',
    useTLS: true,
  });

  console.log('Pusher initialized', { cluster: process.env.PUSHER_CLUSTER || 'eu' });
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
    const pusher = getPusherServer();
    const channel = getChatChannel(chatId);

    await pusher.trigger(channel, event, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    console.log('Pusher event triggered', { channel, event, chatId });
  } catch (error) {
    console.error('Failed to trigger Pusher event', { error, chatId, event });
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
  const pusher = getPusherServer();

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

