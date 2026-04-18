import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { useUser } from './useUser';

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

interface UseChatWebSocketOptions {
  chatId: number;
  onNewMessage?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onMessageDeleted?: (messageId: number) => void;
  onUserJoined?: (userId: number) => void;
  onUserLeft?: (userId: number) => void;
  onTyping?: (userId: number) => void;
}

export function useChatWebSocket(options: UseChatWebSocketOptions) {
  const { chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onUserJoined, onUserLeft, onTyping } = options;
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);

  // Get token from cookies
  const getToken = () => {
    if (typeof document === 'undefined') return '';
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('session='))
      ?.split('=')[1] || '';
  };

  // Construct WebSocket URL
  const wsUrl = user
    ? `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3004'}/ws?token=${getToken()}&chatId=${chatId}`
    : null;

  const { sendMessage, isConnected: wsConnected } = useWebSocket(wsUrl, {
    onMessage: (message) => {
      switch (message.type) {
        case 'new_message':
          if (onNewMessage && message.data.message) {
            onNewMessage(message.data.message);
          }
          break;

        case 'message_updated':
          if (onMessageUpdated && message.data.message) {
            onMessageUpdated(message.data.message);
          }
          break;

        case 'message_deleted':
          if (onMessageDeleted && message.data.messageId) {
            onMessageDeleted(message.data.messageId);
          }
          break;

        case 'user_joined':
          if (onUserJoined && message.data.userId) {
            onUserJoined(message.data.userId);
          }
          break;

        case 'user_left':
          if (onUserLeft && message.data.userId) {
            onUserLeft(message.data.userId);
          }
          break;

        case 'user_typing':
          if (onTyping && message.data.userId) {
            onTyping(message.data.userId);
          }
          break;

        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    },
    onOpen: () => {
      setIsConnected(true);
      console.log('Chat WebSocket connected');
    },
    onClose: () => {
      setIsConnected(false);
      console.log('Chat WebSocket disconnected');
    },
    onError: (error) => {
      console.error('Chat WebSocket error:', error);
    },
    reconnect: true,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  // Send typing indicator
  const sendTypingIndicator = () => {
    sendMessage({
      type: 'typing',
      data: { chatId, userId: user?.id },
    });
  };

  // Join chat room
  const joinChat = () => {
    sendMessage({
      type: 'join_chat',
      data: { chatId, userId: user?.id },
    });
  };

  // Leave chat room
  const leaveChat = () => {
    sendMessage({
      type: 'leave_chat',
      data: { chatId, userId: user?.id },
    });
  };

  return {
    isConnected,
    sendTypingIndicator,
    joinChat,
    leaveChat,
  };
}

