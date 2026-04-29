import Ably from 'ably';

let ablyInstance: Ably.Rest | null = null;

function getAblyServer(): Ably.Rest {
  if (ablyInstance) return ablyInstance;

  if (!process.env.ABLY_API_KEY) {
    // Dev fallback — log only, never throw
    return {
      channels: {
        get: () => ({
          publish: async (...args: unknown[]) => {
            console.log('Mock Ably publish:', ...args);
          },
        }),
      },
      auth: { createTokenRequest: async () => ({}) },
    } as unknown as Ably.Rest;
  }

  ablyInstance = new Ably.Rest({ key: process.env.ABLY_API_KEY });
  return ablyInstance;
}

/** @deprecated use getAblyServer() directly */
export function getPusherServer() {
  return getAblyServer();
}

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

export function getChatChannel(chatId: number): string {
  return `private-chat-${chatId}`;
}

export function getUserPresenceChannel(userId: number): string {
  return `presence-user-${userId}`;
}

export async function triggerChatEvent(chatId: number, event: PusherEvent, data: unknown): Promise<void> {
  try {
    const ably = getAblyServer();
    const channel = ably.channels.get(getChatChannel(chatId));
    await channel.publish(event, { ...((data as object) ?? {}), timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to trigger Ably event', { error, chatId, event });
  }
}

export async function authenticatePusherChannel(
  _socketId: string,
  _channelName: string,
  userId: number,
  _userInfo?: { name: string; avatar?: string }
) {
  const ably = getAblyServer();
  const tokenRequest = await (ably as Ably.Rest).auth.createTokenRequest({
    clientId: userId.toString(),
  });
  return tokenRequest;
}

