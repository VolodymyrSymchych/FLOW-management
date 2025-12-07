import axios, { AxiosInstance } from 'axios';

const TASK_SERVICE_URL = process.env.NEXT_PUBLIC_TASK_SERVICE_URL || 'http://localhost:3005';

class TaskServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: TASK_SERVICE_URL,
      timeout: 10000,
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

    // Add user JWT token (for user authentication)
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add service API key (for service-to-service authentication, server-side only)
    if (typeof window === 'undefined') {
      const serviceApiKey = process.env.TASK_SERVICE_API_KEY;
      if (serviceApiKey) {
        headers['X-Service-API-Key'] = serviceApiKey;
      }
    }

    return headers;
  }

  /**
   * Get all tasks
   */
  async getTasks(projectId?: number): Promise<{ tasks?: any[]; total?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const params = projectId ? { projectId: projectId.toString() } : {};
      const response = await this.client.get(`/api/tasks`, { headers, params });
      return { tasks: response.data.tasks, total: response.data.total };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get tasks',
      };
    }
  }

  /**
   * Get tasks by team ID
   */
  async getTasksByTeam(teamId: number): Promise<{ tasks?: any[]; total?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const params = { teamId: teamId.toString() };
      const response = await this.client.get(`/api/tasks`, { headers, params });
      return { tasks: response.data.tasks, total: response.data.total };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get tasks by team',
      };
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: number): Promise<{ task?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/tasks/${taskId}`, { headers });
      return { task: response.data.task };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get task',
      };
    }
  }

  /**
   * Get subtasks
   */
  async getSubtasks(taskId: number): Promise<{ subtasks?: any[]; total?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/tasks/${taskId}/subtasks`, { headers });
      return { subtasks: response.data.subtasks, total: response.data.total };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get subtasks',
      };
    }
  }

  /**
   * Get dependencies
   */
  async getDependencies(taskId: number): Promise<{ dependencies?: any[]; total?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/tasks/${taskId}/dependencies`, { headers });
      return { dependencies: response.data.dependencies, total: response.data.total };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get dependencies',
      };
    }
  }

  /**
   * Get Gantt chart data
   */
  async getGanttData(projectId?: number): Promise<{ tasks?: any[]; total?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const params = projectId ? { projectId: projectId.toString() } : {};
      const response = await this.client.get(`/api/tasks/gantt`, { headers, params });
      return { tasks: response.data.tasks, total: response.data.total };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get Gantt data',
      };
    }
  }

  /**
   * Create task
   */
  async createTask(data: {
    title: string;
    description?: string;
    projectId?: number;
    assignee?: string;
    startDate?: string;
    dueDate?: string;
    endDate?: string;
    status?: string;
    priority?: string;
    dependsOn?: number[];
    progress?: number;
    parentId?: number;
  }): Promise<{ task?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/tasks`, data, { headers });
      return { task: response.data.task };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to create task',
      };
    }
  }

  /**
   * Create subtask
   */
  async createSubtask(taskId: number, data: {
    title: string;
    description?: string;
    assignee?: string;
    startDate?: string;
    dueDate?: string;
    status?: string;
    priority?: string;
    progress?: number;
  }): Promise<{ task?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/tasks/${taskId}/subtasks`, data, { headers });
      return { task: response.data.task };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to create subtask',
      };
    }
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      projectId?: number | null;
      assignee?: string | null;
      startDate?: string;
      dueDate?: string;
      endDate?: string;
      status?: string;
      priority?: string;
      dependsOn?: number[] | null;
      progress?: number;
      parentId?: number | null;
    }
  ): Promise<{ task?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.put(`/api/tasks/${taskId}`, data, { headers });
      return { task: response.data.task };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to update task',
      };
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/tasks/${taskId}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to delete task',
      };
    }
  }

  /**
   * Check task lock status
   */
  async checkLock(taskId: number): Promise<{
    isLocked?: boolean;
    lockedBy?: string;
    lockedAt?: string;
    canEdit?: boolean;
    error?: string;
  }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/tasks/${taskId}/lock`, { headers });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to check lock',
      };
    }
  }

  /**
   * Acquire lock on task
   */
  async acquireLock(taskId: number): Promise<{
    success?: boolean;
    lockedBy?: number;
    lockedAt?: string;
    error?: string;
  }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/tasks/${taskId}/lock`, {}, { headers });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to acquire lock',
      };
    }
  }

  /**
   * Release lock on task
   */
  async releaseLock(taskId: number): Promise<{ success?: boolean; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.delete(`/api/tasks/${taskId}/lock`, { headers });
      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to release lock',
      };
    }
  }
}

export const taskService = new TaskServiceClient();

