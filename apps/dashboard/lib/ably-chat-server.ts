import Ably from 'ably';

let ablyRest: Ably.Rest | null = null;

function getAblyRest(): Ably.Rest {
  if (ablyRest) return ablyRest;
  if (!process.env.ABLY_API_KEY) {
    return {
      request: async (...args: unknown[]) => {
        console.log('[dev] Mock Ably Chat publish', ...args);
        return { success: true, items: [{}] } as unknown as Ably.HttpPaginatedResponse;
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
    // version=4 matches @ably/chat SDK's _apiProtocolVersion; body is 5th arg, params is 4th
    await ably.request(
      'POST',
      `/chat/v4/rooms/${encodeURIComponent(roomId)}/messages`,
      4,
      null,
      payload,
    );
  } catch (error) {
    console.error('[ably-chat] Failed to publish message', { roomId, error });
  }
}

/** Update a message in an Ably Chat room */
export async function updateChatMessage(
  roomId: string,
  serial: string,
  text: string,
): Promise<void> {
  try {
    const ably = getAblyRest();
    await ably.request(
      'PUT',
      `/chat/v4/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(serial)}`,
      4,
      null,
      { text },
    );
  } catch (error) {
    console.error('[ably-chat] Failed to update message', { roomId, serial, error });
  }
}

/** Delete a message in an Ably Chat room */
export async function deleteChatMessage(
  roomId: string,
  serial: string,
): Promise<void> {
  try {
    const ably = getAblyRest();
    await ably.request(
      'DELETE',
      `/chat/v4/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(serial)}`,
      4,
      null,
      {},
    );
  } catch (error) {
    console.error('[ably-chat] Failed to delete message', { roomId, serial, error });
  }
}

export function chatRoomId(chatId: number): string {
  return `chat-${chatId}`;
}
