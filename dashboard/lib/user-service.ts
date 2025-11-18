import axios, { AxiosInstance } from 'axios';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3003';

class UserServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: USER_SERVICE_URL,
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
      const serviceApiKey = process.env.USER_SERVICE_API_KEY;
      if (serviceApiKey) {
        headers['X-Service-API-Key'] = serviceApiKey;
      }
    }
    
    return headers;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<{ user?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/users/${userId}`, { headers });
      return { user: response.data.user };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get user',
      };
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 10): Promise<{ users?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/users/search`, {
        params: { q: query, limit },
        headers,
      });
      return { users: response.data.users };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to search users',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: number,
    data: { fullName?: string | null; avatarUrl?: string | null }
  ): Promise<{ user?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.put(`/api/users/${userId}/profile`, data, { headers });
      return { user: response.data.user };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to update profile',
      };
    }
  }

  /**
   * Get current user
   */
  async getMe(): Promise<{ user?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/users/me`, { headers });
      return { user: response.data.user };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get current user',
      };
    }
  }

  /**
   * Get friends and pending requests
   */
  async getFriends(): Promise<{ friends?: any[]; pendingRequests?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/friends`, { headers });
      return {
        friends: response.data.friends,
        pendingRequests: response.data.pendingRequests,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get friends',
      };
    }
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(data: {
    receiverEmail?: string;
    emailOrUsername?: string;
    receiverId?: number;
  }): Promise<{ friendship?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/friends/requests`, data, { headers });
      return { friendship: response.data.friendship };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to send friend request',
      };
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: number): Promise<{ friendship?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/friends/requests/${requestId}/accept`, {}, { headers });
      return { friendship: response.data.friendship };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to accept friend request',
      };
    }
  }

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.post(`/api/friends/requests/${requestId}/reject`, {}, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to reject friend request',
      };
    }
  }

  /**
   * Remove friendship (unfriend)
   */
  async removeFriendship(friendshipId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/friends/${friendshipId}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to remove friendship',
      };
    }
  }
}

export const userService = new UserServiceClient();

