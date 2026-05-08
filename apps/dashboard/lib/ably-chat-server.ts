import Ably from 'ably';

let ablyRest: Ably.Rest | null = null;

function getAblyRest(): Ably.Rest {
  if (ablyRest) return ablyRest;
  if (!process.env.ABLY_API_KEY) {
    return {
      request: async (...args: unknown[]) => {
        console.log('[dev] Mock Ably Chat publish', ...args);
        return { items: [{}] } as unknown as Ably.HttpPaginatedResponse;
      },
    } as unknown as Ably.Rest;
  }
  ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY });
  return ablyRest;
}

export interface ChatMessagePayload {
  text: string;
  metadata?: Record<string, unknown>;
}

/** Publish a message to an Ably Chat room via the Chat REST API v4 */
export async function publishChatMessage(
  roomId: string,
  payload: ChatMessagePayload,
): Promise<void> {
  try {
    const ably = getAblyRest();
    await ably.request(
      'POST',
      `/chat/v4/rooms/${encodeURIComponent(roomId)}/messages`,
      3,
      payload,
      {},
    );
  } catch (error) {
    console.error('[ably-chat] Failed to publish message', { roomId, error });
  }
}

/** Typing indicator — publish typing.started/stopped event */
export async function publishTypingEvent(
  roomId: string,
  clientId: string,
  started: boolean,
): Promise<void> {
  try {
    const ably = getAblyRest();
    const channel = ably.channels.get(`${roomId}::$chat`);
    await channel.publish(started ? 'typing.started' : 'typing.stopped', {
      clientId,
    });
  } catch (error) {
    console.error('[ably-chat] Failed to publish typing event', { roomId, error });
  }
}

export function chatRoomId(chatId: number): string {
  return `chat-${chatId}`;
}
