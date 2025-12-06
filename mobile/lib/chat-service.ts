/**
 * Chat Service API Client for Mobile
 */

import axios from 'axios';

const CHAT_SERVICE_URL = process.env.EXPO_PUBLIC_CHAT_SERVICE_URL || 'https://flow-chat-service.vercel.app';

console.log('Chat Service URL:', CHAT_SERVICE_URL);

const api = axios.create({
    baseURL: CHAT_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_CHAT_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('[ChatService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('[ChatService] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const chatService = {
    // ==================== Chat Methods ====================

    /**
     * Get user's chats
     */
    async getUserChats(token: string): Promise<{ chats?: any[]; error?: string }> {
        try {
            const response = await api.get('/api/chats/my', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { chats: response.data.chats };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get chats',
            };
        }
    },

    /**
     * Get project chats
     */
    async getProjectChats(token: string, projectId: number): Promise<{ chats?: any[]; error?: string }> {
        try {
            const response = await api.get(`/api/chats/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { chats: response.data.chats };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get project chats',
            };
        }
    },

    /**
     * Get team chats
     */
    async getTeamChats(token: string, teamId: number): Promise<{ chats?: any[]; error?: string }> {
        try {
            const response = await api.get(`/api/chats/team/${teamId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { chats: response.data.chats };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get team chats',
            };
        }
    },

    /**
     * Find or create direct chat
     */
    async findOrCreateDirectChat(
        token: string,
        userId1: number,
        userId2: number
    ): Promise<{ chat?: any; error?: string }> {
        try {
            const response = await api.post('/api/chats/direct', { userId1, userId2 }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { chat: response.data.chat };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to find or create direct chat',
            };
        }
    },

    /**
     * Get chat by ID
     */
    async getChatById(token: string, chatId: number): Promise<{ chat?: any; error?: string }> {
        try {
            const response = await api.get(`/api/chats/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { chat: response.data.chat };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get chat',
            };
        }
    },

    /**
     * Get chat members
     */
    async getChatMembers(token: string, chatId: number): Promise<{ members?: any[]; error?: string }> {
        try {
            const response = await api.get(`/api/chats/${chatId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { members: response.data.members };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get chat members',
            };
        }
    },

    // ==================== Message Methods ====================

    /**
     * Send message
     */
    async sendMessage(
        token: string,
        data: {
            chatId: number;
            content: string;
            messageType?: 'text' | 'file' | 'system';
            replyToId?: number;
            metadata?: string;
        }
    ): Promise<{ message?: any; error?: string }> {
        try {
            const response = await api.post('/api/messages', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { message: response.data.message };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to send message',
            };
        }
    },

    /**
     * Get chat messages
     */
    async getChatMessages(
        token: string,
        chatId: number,
        options?: {
            limit?: number;
            before?: number;
        }
    ): Promise<{ messages?: any[]; error?: string }> {
        try {
            const params = new URLSearchParams();
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.before) params.append('before', options.before.toString());

            const response = await api.get(
                `/api/messages/chat/${chatId}?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return { messages: response.data.messages };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get messages',
            };
        }
    },

    /**
     * Get unread count for chat
     */
    async getUnreadCount(token: string, chatId: number): Promise<{ count?: number; error?: string }> {
        try {
            const response = await api.get(`/api/messages/chat/${chatId}/unread`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { count: response.data.count };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get unread count',
            };
        }
    },

    /**
     * Mark chat as read
     */
    async markChatAsRead(token: string, chatId: number): Promise<{ error?: string }> {
        try {
            await api.put(`/api/messages/chat/${chatId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to mark chat as read',
            };
        }
    },

    /**
     * Edit message
     */
    async editMessage(token: string, messageId: number, content: string): Promise<{ message?: any; error?: string }> {
        try {
            const response = await api.put(`/api/messages/${messageId}`, { content }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { message: response.data.message };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to edit message',
            };
        }
    },

    /**
     * Delete message
     */
    async deleteMessage(token: string, messageId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete message',
            };
        }
    },

    /**
     * Add reaction to message
     */
    async addReaction(token: string, messageId: number, emoji: string): Promise<{ reaction?: any; error?: string }> {
        try {
            const response = await api.post(`/api/messages/${messageId}/reactions`, { emoji }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { reaction: response.data.reaction };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to add reaction',
            };
        }
    },

    /**
     * Remove reaction from message
     */
    async removeReaction(token: string, messageId: number, emoji: string): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/messages/${messageId}/reactions/${emoji}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to remove reaction',
            };
        }
    },
};
