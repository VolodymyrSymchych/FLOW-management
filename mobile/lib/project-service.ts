/**
 * Project Service API Client for Mobile
 * Adapted from dashboard/lib/project-service.ts
 */

import axios from 'axios';
import Constants from 'expo-constants';

const PROJECT_SERVICE_URL = process.env.EXPO_PUBLIC_PROJECT_SERVICE_URL || 'https://flow-project-service.vercel.app';

console.log('Project Service URL:', PROJECT_SERVICE_URL);

const api = axios.create({
    baseURL: PROJECT_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_PROJECT_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        console.log(`[ProjectService] ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuthHeader: !!config.headers?.Authorization,
            hasApiKey: !!config.headers?.['X-Service-API-Key'],
        });
        return config;
    },
    (error) => {
        console.error('[ProjectService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[ProjectService] Response ${response.status} from ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[ProjectService] Response error:', {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

export const projectService = {
    async getProjects(token: string): Promise<{ projects?: any[]; total?: number; error?: string }> {
        try {
            const response = await api.get('/api/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { projects: response.data.projects, total: response.data.total };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get projects',
            };
        }
    },

    async getProject(token: string, projectId: number): Promise<{ project?: any; error?: string }> {
        try {
            const response = await api.get(`/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { project: response.data.project };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get project',
            };
        }
    },

    async createProject(token: string, data: any): Promise<{ project?: any; error?: string }> {
        try {
            const response = await api.post('/api/projects', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { project: response.data.project };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to create project',
            };
        }
    },

    async updateProject(token: string, projectId: number, data: any): Promise<{ project?: any; error?: string }> {
        try {
            const response = await api.put(`/api/projects/${projectId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { project: response.data.project };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update project',
            };
        }
    },

    async deleteProject(token: string, projectId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete project',
            };
        }
    },

    async getStats(token: string): Promise<{ stats?: any; error?: string }> {
        try {
            const response = await api.get('/api/projects/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { stats: response.data.stats };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get stats',
            };
        }
    }
};
