/**
 * Team Service API Client for Mobile
 * Updated to match backend API endpoints
 */

import axios from 'axios';

const TEAM_SERVICE_URL = process.env.EXPO_PUBLIC_TEAM_SERVICE_URL || 'https://flow-team-service.vercel.app';

console.log('Team Service URL:', TEAM_SERVICE_URL);

const api = axios.create({
    baseURL: TEAM_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_TEAM_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('[TeamService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('[TeamService] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const teamService = {
    /**
     * Get all teams for current user
     */
    async getTeams(token: string): Promise<{ teams?: any[]; error?: string }> {
        try {
            const response = await api.get('/api/teams', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { teams: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get teams',
            };
        }
    },

    /**
     * Get team by ID
     */
    async getTeam(token: string, teamId: number): Promise<{ team?: any; error?: string }> {
        try {
            const response = await api.get(`/api/teams/${teamId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { team: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get team',
            };
        }
    },

    /**
     * Create new team
     */
    async createTeam(
        token: string,
        data: {
            name: string;
            description?: string;
        }
    ): Promise<{ team?: any; error?: string }> {
        try {
            const response = await api.post('/api/teams', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { team: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to create team',
            };
        }
    },

    /**
     * Update team
     */
    async updateTeam(
        token: string,
        teamId: number,
        data: {
            name?: string;
            description?: string;
        }
    ): Promise<{ team?: any; error?: string }> {
        try {
            const response = await api.put(`/api/teams/${teamId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { team: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update team',
            };
        }
    },

    /**
     * Delete team
     */
    async deleteTeam(token: string, teamId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/teams/${teamId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete team',
            };
        }
    },

    /**
     * Get team members
     */
    async getTeamMembers(token: string, teamId: number): Promise<{ members?: any[]; error?: string }> {
        try {
            const response = await api.get(`/api/teams/${teamId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { members: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get team members',
            };
        }
    },

    /**
     * Add team member
     */
    async addTeamMember(
        token: string,
        teamId: number,
        data: {
            userId: number;
            role?: 'owner' | 'admin' | 'member';
        }
    ): Promise<{ member?: any; error?: string }> {
        try {
            const response = await api.post(`/api/teams/${teamId}/members`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { member: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to add team member',
            };
        }
    },

    /**
     * Remove team member
     */
    async removeTeamMember(token: string, teamId: number, userId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/teams/${teamId}/members/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to remove team member',
            };
        }
    },

    /**
     * Update team member role
     */
    async updateMemberRole(
        token: string,
        teamId: number,
        userId: number,
        role: 'owner' | 'admin' | 'member'
    ): Promise<{ member?: any; error?: string }> {
        try {
            const response = await api.put(
                `/api/teams/${teamId}/members/${userId}/role`,
                { role },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return { member: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update member role',
            };
        }
    },
};
