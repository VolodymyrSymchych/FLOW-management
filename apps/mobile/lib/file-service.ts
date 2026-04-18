/**
 * File Service API Client for Mobile
 */

import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';

const FILE_SERVICE_URL = process.env.EXPO_PUBLIC_FILE_SERVICE_URL || 'https://flow-file-service.vercel.app';

console.log('File Service URL:', FILE_SERVICE_URL);

const api = axios.create({
    baseURL: FILE_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_FILE_SERVICE_API_KEY || '',
    },
    timeout: 60000, // 60s for file uploads
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('[FileService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('[FileService] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const fileService = {
    /**
     * Upload file
     */
    async uploadFile(
        token: string,
        file: { uri: string; name: string; type: string },
        projectId?: number,
        taskId?: number
    ): Promise<{ file?: any; error?: string }> {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);
            if (projectId) formData.append('projectId', projectId.toString());
            if (taskId) formData.append('taskId', taskId.toString());

            const response = await api.post('/api/files', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { file: response.data.file };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to upload file',
            };
        }
    },

    /**
     * Get files
     */
    async getFiles(
        token: string,
        projectId?: number,
        taskId?: number
    ): Promise<{ files?: any[]; error?: string }> {
        try {
            const params = new URLSearchParams();
            if (projectId) params.append('projectId', projectId.toString());
            if (taskId) params.append('taskId', taskId.toString());

            const response = await api.get(`/api/files?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { files: response.data.files };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get files',
            };
        }
    },

    /**
     * Get file by ID
     */
    async getFile(token: string, fileId: number): Promise<{ file?: any; error?: string }> {
        try {
            const response = await api.get(`/api/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { file: response.data.file };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get file',
            };
        }
    },

    /**
     * Download file (get URL)
     */
    async downloadFile(token: string, fileId: number): Promise<{ url?: string; error?: string }> {
        try {
            const response = await api.get(`/api/files/${fileId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { url: response.data.url };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get download URL',
            };
        }
    },

    /**
     * Delete file
     */
    async deleteFile(token: string, fileId: number): Promise<{ error?: string }> {
        try {
            await api.delete(`/api/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete file',
            };
        }
    },

    /**
     * Pick document from device
     */
    async pickDocument(): Promise<{ file?: { uri: string; name: string; type: string }; error?: string }> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return { error: 'Document selection cancelled' };
            }

            const asset = result.assets[0];
            return {
                file: {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/octet-stream',
                },
            };
        } catch (error: any) {
            return {
                error: error.message || 'Failed to pick document',
            };
        }
    },
};
