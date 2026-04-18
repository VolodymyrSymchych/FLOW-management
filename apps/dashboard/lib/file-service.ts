import axios, { AxiosInstance } from 'axios';

const FILE_SERVICE_URL = process.env.NEXT_PUBLIC_FILE_SERVICE_URL || 'http://localhost:3007';

class FileServiceClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: FILE_SERVICE_URL,
            timeout: 60000, // 60s for file uploads
            withCredentials: true,
        });
    }

    private async getAuthToken(): Promise<string | null> {
        if (typeof document !== 'undefined') {
            return null;
        }
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            return cookieStore.get('auth_token')?.value || null;
        } catch (error) {
            return null;
        }
    }

    private async getHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {};

        const token = await this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (typeof window === 'undefined') {
            const serviceApiKey = process.env.FILE_SERVICE_API_KEY;
            if (serviceApiKey) {
                headers['X-Service-API-Key'] = serviceApiKey;
            }
        }

        return headers;
    }

    /**
     * Upload file
     */
    async uploadFile(
        file: File,
        projectId?: number,
        taskId?: number
    ): Promise<{ file?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const formData = new FormData();
            formData.append('file', file);
            if (projectId) formData.append('projectId', projectId.toString());
            if (taskId) formData.append('taskId', taskId.toString());

            const response = await this.client.post('/api/files', formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { file: response.data.file };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to upload file',
            };
        }
    }

    /**
     * Get files
     */
    async getFiles(projectId?: number, taskId?: number): Promise<{ files?: any[]; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const params = new URLSearchParams();
            if (projectId) params.append('projectId', projectId.toString());
            if (taskId) params.append('taskId', taskId.toString());

            const response = await this.client.get(`/api/files?${params.toString()}`, { headers });
            return { files: response.data.files };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get files',
            };
        }
    }

    /**
     * Get file by ID
     */
    async getFile(fileId: number): Promise<{ file?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/files/${fileId}`, { headers });
            return { file: response.data.file };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get file',
            };
        }
    }

    /**
     * Download file
     */
    async downloadFile(fileId: number): Promise<{ url?: string; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/files/${fileId}/download`, { headers });
            return { url: response.data.url };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get download URL',
            };
        }
    }

    /**
     * Delete file
     */
    async deleteFile(fileId: number): Promise<{ error?: string }> {
        try {
            const headers = await this.getHeaders();
            await this.client.delete(`/api/files/${fileId}`, { headers });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete file',
            };
        }
    }

    /**
     * Create file version
     */
    async createVersion(fileId: number, file: File): Promise<{ file?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const formData = new FormData();
            formData.append('file', file);

            const response = await this.client.post(`/api/files/${fileId}/version`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { file: response.data.file };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to create version',
            };
        }
    }

    /**
     * Get file versions
     */
    async getVersions(fileId: number): Promise<{ versions?: any[]; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/files/${fileId}/versions`, { headers });
            return { versions: response.data.versions };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get versions',
            };
        }
    }

    /**
     * Update file metadata
     */
    async updateMetadata(fileId: number, fileName: string): Promise<{ file?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(`/api/files/${fileId}`, { fileName }, { headers });
            return { file: response.data.file };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update metadata',
            };
        }
    }
}

export const fileService = new FileServiceClient();
