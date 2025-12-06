/**
 * User Service API Client for Mobile
 */

import axios from 'axios';

const USER_SERVICE_URL = process.env.EXPO_PUBLIC_USER_SERVICE_URL || 'https://flow-user-service.vercel.app';

console.log('User Service URL:', USER_SERVICE_URL);

const api = axios.create({
    baseURL: USER_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_USER_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('[UserService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('[UserService] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const userService = {
    /**
     * Get user by ID
     */
    async getUser(token: string, userId: number): Promise<{ user?: any; error?: string }> {
        try {
            const response = await api.get(`/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { user: response.data.user };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get user',
            };
        }
    },

    /**
     * Get current user
     */
    async getMe(token: string): Promise<{ user?: any; error?: string }> {
        try {
            const response = await api.get('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { user: response.data.user };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get current user',
            };
        }
    },

    /**
     * Search users
     */
    async searchUsers(token: string, query: string, limit: number = 10): Promise<{ users?: any[]; error?: string }> {
        try {
            const response = await api.get('/api/users/search', {
                params: { q: query, limit },
                headers: { Authorization: `Bearer ${token}` },
            });
            return { users: response.data.users };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to search users',
            };
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(
        token: string,
        userId: number,
        data: { fullName?: string | null; avatarUrl?: string | null }
    ): Promise<{ user?: any; error?: string }> {
        try {
            const response = await api.put(`/api/users/${userId}/profile`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { user: response.data.user };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update profile',
            };
        }
    },

    /**
     * Get friends and pending requests
     */
    async getFriends(token: string): Promise<{ friends?: any[]; pendingRequests?: any[]; error?: string }> {
        try {
            const response = await api.get('/api/friends', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {
                friends: response.data.friends,
                pendingRequests: response.data.pendingRequests,
            };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get friends',
            };
        }
    },

    /**
     * Send friend request
     */
    async sendFriendRequest(
        token: string,
        data: {
            receiverEmail?: string;
            emailOrUsername?: string;
            receiverId?: number;
        }
    ): Promise<{ friendship?: any; error?: string }> {
        try {
            const response = await api.post('/api/friends/requests', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { friendship: response.data.friendship };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to send friend request',
            };
        }
    },

    /**
     * Accept friend request
     */
    async acceptFriendRequest(token: string, requestId: number): Promise<{ friendship?: any; error?: string }> {
        try {
            const response = await api.post(`/api/friends/requests/${requestId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { friendship: response.data.friendship };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to accept friend request',
            };
        }
    },

    /**
     * Reject friend request
     */
    async rejectFriendRequest(token: string, requestId: number): Promise<{ error?: string }> {
        try {
            await api.post(`/api/friends/requests/${requestId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to reject friend request',
            };
        }
    },

    /**
     * Remove friendship (unfriend)
     */
    async removeFriendship(token: string, friendshipId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/friends/${friendshipId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to remove friendship',
            };
        }
    },
};
