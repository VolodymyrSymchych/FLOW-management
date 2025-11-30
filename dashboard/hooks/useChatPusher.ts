import { useEffect, useState } from 'react';
import { usePusher } from './usePusher';
import type { Channel } from 'pusher-js';

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
  const { pusher, isConnected } = usePusher();
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!pusher || !isConnected) {
      return;
    }

    // Subscribe to private chat channel
    const channelName = `private-chat-${chatId}`;
    const chatChannel = pusher.subscribe(channelName);

    // Bind event handlers
    chatChannel.bind('new-message', (data: { message: Message; timestamp: string }) => {
      if (onNewMessage && data.message) {
        onNewMessage(data.message);
      }
    });

    chatChannel.bind('message-updated', (data: { message: Message; timestamp: string }) => {
      if (onMessageUpdated && data.message) {
        onMessageUpdated(data.message);
      }
    });

    chatChannel.bind('message-deleted', (data: { messageId: number; timestamp: string }) => {
      if (onMessageDeleted && data.messageId) {
        onMessageDeleted(data.messageId);
      }
    });

    chatChannel.bind('user-joined', (data: { userId: number; role: string; timestamp: string }) => {
      if (onUserJoined && data.userId) {
        onUserJoined(data.userId);
      }
    });

    chatChannel.bind('user-left', (data: { userId: number; timestamp: string }) => {
      if (onUserLeft && data.userId) {
        onUserLeft(data.userId);
      }
    });

    chatChannel.bind('user-typing', (data: { userId: number; timestamp: string }) => {
      if (onTyping && data.userId) {
        onTyping(data.userId);
      }
    });

    chatChannel.bind('pusher:subscription_succeeded', () => {
      console.log(`Subscribed to ${channelName}`);
    });

    chatChannel.bind('pusher:subscription_error', (error: any) => {
      console.error(`Failed to subscribe to ${channelName}:`, error);
    });

    setChannel(chatChannel);

    return () => {
      chatChannel.unbind_all();
      pusher.unsubscribe(channelName);
      setChannel(null);
    };
  }, [pusher, isConnected, chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onUserJoined, onUserLeft, onTyping]);

  // Send typing indicator
  const sendTypingIndicator = () => {
    if (channel) {
      channel.trigger('client-typing', {});
    }
  };

  return {
    isConnected,
    sendTypingIndicator,
  };
}

