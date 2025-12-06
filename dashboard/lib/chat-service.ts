import axios, { AxiosInstance } from 'axios';

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:3006';

class ChatServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CHAT_SERVICE_URL,
      timeout: 10000,
      withCredentials: true,
    });
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof document !== 'undefined') {
      // Client-side: cookies are automatically sent with withCredentials: true
      return null;
    }
    // Server-side: get from cookies
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('auth_token')?.value || null;
    } catch (error) {
      // If cookies() fails (e.g., in middleware), return null
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    // Add user JWT token (for user authentication)
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add service API key (for service-to-service authentication, server-side only)
    if (typeof window === 'undefined') {
      const serviceApiKey = process.env.CHAT_SERVICE_API_KEY;
      if (serviceApiKey) {
        headers['X-Service-API-Key'] = serviceApiKey;
      }
    }

    return headers;
  }

  // ==================== Chat Methods ====================

  /**
   * Get user's chats
   */
  async getUserChats(): Promise<{ chats?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get('/api/chats/my', { headers });
      return { chats: response.data.chats };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get chats',
      };
    }
  }

  /**
   * Get project chats
   */
  async getProjectChats(projectId: number): Promise<{ chats?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/chats/project/${projectId}`, { headers });
      return { chats: response.data.chats };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get project chats',
      };
    }
  }

  /**
   * Get team chats
   */
  async getTeamChats(teamId: number): Promise<{ chats?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/chats/team/${teamId}`, { headers });
      return { chats: response.data.chats };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get team chats',
      };
    }
  }

  /**
   * Find or create direct chat
   */
  async findOrCreateDirectChat(userId1: number, userId2: number): Promise<{ chat?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post('/api/chats/direct', { userId1, userId2 }, { headers });
      return { chat: response.data.chat };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to find or create direct chat',
      };
    }
  }

  /**
   * Create chat
   */
  async createChat(data: {
    name?: string;
    type?: 'direct' | 'group' | 'project' | 'team';
    projectId?: number;
    teamId?: number;
  }): Promise<{ chat?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post('/api/chats', data, { headers });
      return { chat: response.data.chat };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to create chat',
      };
    }
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: number): Promise<{ chat?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/chats/${chatId}`, { headers });
      return { chat: response.data.chat };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get chat',
      };
    }
  }

  /**
   * Update chat
   */
  async updateChat(chatId: number, data: { name?: string }): Promise<{ chat?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.put(`/api/chats/${chatId}`, data, { headers });
      return { chat: response.data.chat };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to update chat',
      };
    }
  }

  /**
   * Delete chat
   */
  async deleteChat(chatId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/chats/${chatId}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to delete chat',
      };
    }
  }

  /**
   * Get chat members
   */
  async getChatMembers(chatId: number): Promise<{ members?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/chats/${chatId}/members`, { headers });
      return { members: response.data.members };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get chat members',
      };
    }
  }

  /**
   * Add member to chat
   */
  async addMember(chatId: number, userId: number, role?: 'admin' | 'member'): Promise<{ member?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/chats/${chatId}/members`, { userId, role }, { headers });
      return { member: response.data.member };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to add member',
      };
    }
  }

  /**
   * Remove member from chat
   */
  async removeMember(chatId: number, userId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/chats/${chatId}/members/${userId}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to remove member',
      };
    }
  }

  // ==================== Message Methods ====================

  /**
   * Send message
   */
  async sendMessage(data: {
    chatId: number;
    content: string;
    messageType?: 'text' | 'file' | 'system';
    replyToId?: number;
    metadata?: string;
  }): Promise<{ message?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post('/api/messages', data, { headers });
      return { message: response.data.message };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to send message',
      };
    }
  }

  /**
   * Get chat messages
   */
  async getChatMessages(
    chatId: number,
    options?: {
      limit?: number;
      before?: number;
    }
  ): Promise<{ messages?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.before) params.append('before', options.before.toString());

      const response = await this.client.get(
        `/api/messages/chat/${chatId}?${params.toString()}`,
        { headers }
      );
      return { messages: response.data.messages };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get messages',
      };
    }
  }

  /**
   * Get unread count for chat
   */
  async getUnreadCount(chatId: number): Promise<{ count?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/messages/chat/${chatId}/unread`, { headers });
      return { count: response.data.count };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get unread count',
      };
    }
  }

  /**
   * Mark chat as read
   */
  async markChatAsRead(chatId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.put(`/api/messages/chat/${chatId}/read`, {}, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to mark chat as read',
      };
    }
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: number): Promise<{ message?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/messages/${messageId}`, { headers });
      return { message: response.data.message };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get message',
      };
    }
  }

  /**
   * Edit message
   */
  async editMessage(messageId: number, content: string): Promise<{ message?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.put(`/api/messages/${messageId}`, { content }, { headers });
      return { message: response.data.message };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to edit message',
      };
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/messages/${messageId}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to delete message',
      };
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.put(`/api/messages/${messageId}/read`, {}, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to mark message as read',
      };
    }
  }

  /**
   * Get message reactions
   */
  async getReactions(messageId: number): Promise<{ reactions?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/messages/${messageId}/reactions`, { headers });
      return { reactions: response.data.reactions };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get reactions',
      };
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: number, emoji: string): Promise<{ reaction?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/messages/${messageId}/reactions`, { emoji }, { headers });
      return { reaction: response.data.reaction };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to add reaction',
      };
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: number, emoji: string): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/messages/${messageId}/reactions/${emoji}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to remove reaction',
      };
    }
  }
}

export const chatService = new ChatServiceClient();
