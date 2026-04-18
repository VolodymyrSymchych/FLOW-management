/**
 * Task Service API Client for Mobile
 * Adapted from dashboard/lib/task-service.ts
 */

import axios from 'axios';
import Constants from 'expo-constants';

const TASK_SERVICE_URL = process.env.EXPO_PUBLIC_TASK_SERVICE_URL || 'https://flow-task-service.vercel.app';

console.log('Task Service URL:', TASK_SERVICE_URL);

const api = axios.create({
    baseURL: TASK_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_TASK_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        console.log(`[TaskService] ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuthHeader: !!config.headers?.Authorization,
            hasApiKey: !!config.headers?.['X-Service-API-Key'],
        });
        return config;
    },
    (error) => {
        console.error('[TaskService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[TaskService] Response ${response.status} from ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[TaskService] Response error:', {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

export const taskService = {
    async getTasks(token: string, projectId?: number): Promise<{ tasks?: any[]; total?: number; error?: string }> {
        try {
            const params = projectId ? { projectId } : {};
            const response = await api.get('/api/tasks', {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            return { tasks: response.data.tasks, total: response.data.total };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get tasks',
            };
        }
    },

    async getTask(token: string, taskId: number): Promise<{ task?: any; error?: string }> {
        try {
            const response = await api.get(`/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { task: response.data.task };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get task',
            };
        }
    },

    async createTask(token: string, data: any): Promise<{ task?: any; error?: string }> {
        try {
            const response = await api.post('/api/tasks', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { task: response.data.task };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to create task',
            };
        }
    },

    async updateTask(token: string, taskId: number, data: any): Promise<{ task?: any; error?: string }> {
        try {
            const response = await api.put(`/api/tasks/${taskId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { task: response.data.task };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update task',
            };
        }
    },

    async deleteTask(token: string, taskId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete task',
            };
        }
    },

    async getStats(token: string): Promise<{ stats?: any; error?: string }> {
        // Assuming task service has a stats endpoint, if not we might need to calculate locally or check endpoint
        try {
            // NOTE: Check if this endpoint exists in task-service. usually it might be /api/tasks/stats
            const response = await api.get('/api/tasks/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { stats: response.data.stats };
        } catch (error: any) {
            // Fallback or ignore if endpoint doesn't exist
            console.warn('Task stats endpoint might not exist:', error.message);
            return {
                error: error.response?.data?.error || error.message || 'Failed to get task stats',
            };
        }
    }
};
