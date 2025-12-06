import axios, { AxiosInstance } from 'axios';

const TEAM_SERVICE_URL = process.env.NEXT_PUBLIC_TEAM_SERVICE_URL || 'http://localhost:3004';

class TeamServiceClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: TEAM_SERVICE_URL,
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
            const serviceApiKey = process.env.TEAM_SERVICE_API_KEY;
            if (serviceApiKey) {
                headers['X-Service-API-Key'] = serviceApiKey;
            }
        }

        return headers;
    }

    /**
     * Get all teams for current user
     */
    async getTeams(): Promise<{ teams?: any[]; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get('/api/teams', { headers });
            return { teams: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get teams',
            };
        }
    }

    /**
     * Get team by ID
     */
    async getTeam(teamId: number): Promise<{ team?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/teams/${teamId}`, { headers });
            return { team: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get team',
            };
        }
    }

    /**
     * Create new team
     */
    async createTeam(data: {
        name: string;
        description?: string;
    }): Promise<{ team?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.post('/api/teams', data, { headers });
            return { team: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to create team',
            };
        }
    }

    /**
     * Update team
     */
    async updateTeam(
        teamId: number,
        data: {
            name?: string;
            description?: string;
        }
    ): Promise<{ team?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(`/api/teams/${teamId}`, data, { headers });
            return { team: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update team',
            };
        }
    }

    /**
     * Delete team
     */
    async deleteTeam(teamId: number): Promise<{ error?: string }> {
        try {
            const headers = await this.getHeaders();
            await this.client.delete(`/api/teams/${teamId}`, { headers });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete team',
            };
        }
    }

    /**
     * Get team members
     */
    async getTeamMembers(teamId: number): Promise<{ members?: any[]; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/teams/${teamId}/members`, { headers });
            return { members: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get team members',
            };
        }
    }

    /**
     * Add team member
     */
    async addTeamMember(
        teamId: number,
        data: {
            userId: number;
            role?: 'owner' | 'admin' | 'member';
        }
    ): Promise<{ member?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.post(`/api/teams/${teamId}/members`, data, { headers });
            return { member: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to add team member',
            };
        }
    }

    /**
     * Remove team member
     */
    async removeTeamMember(teamId: number, userId: number): Promise<{ error?: string }> {
        try {
            const headers = await this.getHeaders();
            await this.client.delete(`/api/teams/${teamId}/members/${userId}`, { headers });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to remove team member',
            };
        }
    }

    /**
     * Update team member role
     */
    async updateMemberRole(
        teamId: number,
        userId: number,
        role: 'owner' | 'admin' | 'member'
    ): Promise<{ member?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(
                `/api/teams/${teamId}/members/${userId}/role`,
                { role },
                { headers }
            );
            return { member: response.data.data };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update member role',
            };
        }
    }
}

export const teamService = new TeamServiceClient();
