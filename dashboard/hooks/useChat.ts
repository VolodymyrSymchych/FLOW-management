'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatWebSocket, ChatPolling } from '@/lib/websocket';
import axios from 'axios';
import { useUser } from './useUser';

const axiosInstance = axios.create({
  withCredentials: true,
});

// Fix: Ensure useUser is imported correctly

export interface ChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  messageType: string;
  replyToId?: number;
  readAt?: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  reactions?: Array<{
    id: number;
    emoji: string;
    user: {
      id: number;
      username: string;
    };
  }>;
  attachments?: any[];
  translations?: Record<string, string>;
}

export interface Chat {
  id: number;
  name?: string;
  type: string;
  projectId?: number;
  teamId?: number;
  createdAt: string;
  updatedAt: string;
  members?: Array<{
    id: number;
    userId: number;
    role: string;
    user: {
      id: number;
      username: string;
      fullName?: string;
      avatarUrl?: string;
    };
  }>;
  lastMessage?: ChatMessage;
}

export function useChat() {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const pollingRef = useRef<ChatPolling | null>(null);
  const useWebSocket = useRef(true);

  // Initialize WebSocket or polling
  useEffect(() => {
    if (!user?.id) return;

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || '';

    // Try WebSocket first
    if (useWebSocket.current && typeof WebSocket !== 'undefined') {
      const ws = new ChatWebSocket(user.id, token);
      wsRef.current = ws;

      ws.connect()
        .then(() => {
          console.log('WebSocket connected');
        })
        .catch((err) => {
          console.warn('WebSocket connection failed, falling back to polling:', err);
          useWebSocket.current = false;
          // Fallback to polling
          const polling = new ChatPolling(user.id, window.location.origin);
          pollingRef.current = polling;
          polling.start();
        });
    } else {
      // Use polling directly
      const polling = new ChatPolling(user.id, window.location.origin);
      pollingRef.current = polling;
      polling.start();
    }

    return () => {
      wsRef.current?.disconnect();
      pollingRef.current?.destroy();
    };
  }, [user?.id]);

  // Set up message listeners
  useEffect(() => {
    if (!wsRef.current && !pollingRef.current) return;

    const handler = (data: any) => {
      if (data.type === 'message' && data.message) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
    };

    if (wsRef.current) {
      wsRef.current.on('message', handler);
    }
    if (pollingRef.current) {
      pollingRef.current.on('message', handler);
    }

    return () => {
      // Cleanup handled by disconnect/destroy
    };
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat');
      setChats(response.data.chats || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChat = useCallback(async (chatId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/chat?chatId=${chatId}`);
      setCurrentChat(response.data.chat);
      setMessages(response.data.messages || []);

      // Join chat for real-time updates
      if (wsRef.current) {
        wsRef.current.joinChat(chatId);
      }
      if (pollingRef.current) {
        pollingRef.current.watchChat(chatId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch chat');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    chatId: number,
    content: string,
    messageType: string = 'text',
    replyToId?: number,
    attachmentIds?: number[]
  ) => {
    try {
      const response = await axios.post(`/api/chat/${chatId}/messages`, {
        content,
        messageType,
        replyToId,
        attachmentIds,
      });

      const newMessage = response.data.message;
      setMessages(prev => [...prev, newMessage]);

      // Send via WebSocket if available
      if (wsRef.current) {
        wsRef.current.send('message', {
          action: 'send_message',
          chatId,
          message: newMessage,
        });
      }

      return newMessage;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
      throw err;
    }
  }, []);

  const createDirectChat = useCallback(async (recipientId: number) => {
    try {
      const response = await axios.post('/api/chat', {
        action: 'create',
        type: 'direct',
        recipientId,
      });
      return response.data.chat;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create chat');
      throw err;
    }
  }, []);

  const addReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      const response = await axios.post(`/api/chat/messages/${messageId}/reactions`, {
        emoji,
      });
      return response.data.reaction;
    } catch (err: any) {
      if (err.response?.status !== 409) { // 409 = already reacted
        setError(err.response?.data?.error || 'Failed to add reaction');
      }
      throw err;
    }
  }, []);

  const removeReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      await axios.delete(`/api/chat/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove reaction');
      throw err;
    }
  }, []);

  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      await axios.post(`/api/chat/messages/${messageId}/read`);
    } catch (err: any) {
      // Silently fail - not critical
      console.error('Failed to mark message as read:', err);
    }
  }, []);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    fetchChats,
    fetchChat,
    sendMessage,
    createDirectChat,
    addReaction,
    removeReaction,
    markMessageAsRead,
    setCurrentChat,
    setMessages,
  };
}
