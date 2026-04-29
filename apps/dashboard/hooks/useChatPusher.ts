import { useEffect, useState } from 'react';
import { usePusher } from './usePusher';
import type Ably from 'ably';

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  messageType: 'text' | 'file' | 'system';
  replyToId?: number;
  mentions?: number[];
  taskId?: number;
  readBy?: number[];
  editedAt?: string;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users: number[];
  }>;
  [key: string]: any;
}

interface UseChatPusherOptions {
  chatId: number;
  onNewMessage?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onMessageDeleted?: (messageId: number) => void;
  onUserJoined?: (userId: number) => void;
  onUserLeft?: (userId: number) => void;
  onTyping?: (userId: number) => void;
}

export function useChatPusher(options: UseChatPusherOptions) {
  const { chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onUserJoined, onUserLeft, onTyping } = options;
  const { pusher: ablyClient, isConnected } = usePusher();
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);

  useEffect(() => {
    if (!ablyClient || !isConnected) return;

    const ably = ablyClient as unknown as Ably.Realtime;
    const channelName = `private-chat-${chatId}`;
    const ch = ably.channels.get(channelName);

    ch.subscribe('new-message', (msg) => {
      const data = msg.data as { message: Message; timestamp: string };
      if (onNewMessage && data?.message) onNewMessage(data.message);
    });
    ch.subscribe('message-updated', (msg) => {
      const data = msg.data as { message: Message; timestamp: string };
      if (onMessageUpdated && data?.message) onMessageUpdated(data.message);
    });
    ch.subscribe('message-deleted', (msg) => {
      const data = msg.data as { messageId: number };
      if (onMessageDeleted && data?.messageId) onMessageDeleted(data.messageId);
    });
    ch.subscribe('user-joined', (msg) => {
      const data = msg.data as { userId: number };
      if (onUserJoined && data?.userId) onUserJoined(data.userId);
    });
    ch.subscribe('user-left', (msg) => {
      const data = msg.data as { userId: number };
      if (onUserLeft && data?.userId) onUserLeft(data.userId);
    });
    ch.subscribe('user-typing', (msg) => {
      const data = msg.data as { userId: number };
      if (onTyping && data?.userId) onTyping(data.userId);
    });

    setChannel(ch);

    return () => {
      ch.unsubscribe();
      setChannel(null);
    };
  }, [ablyClient, isConnected, chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onUserJoined, onUserLeft, onTyping]);

  const sendTypingIndicator = () => {
    channel?.publish('user-typing', {});
  };

  return { isConnected, sendTypingIndicator };
}

