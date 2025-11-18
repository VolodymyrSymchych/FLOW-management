import axios, { AxiosInstance } from 'axios';

const PROJECT_SERVICE_URL = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL || 'http://localhost:3004';

class ProjectServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: PROJECT_SERVICE_URL,
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
      const serviceApiKey = process.env.PROJECT_SERVICE_API_KEY;
      if (serviceApiKey) {
        headers['X-Service-API-Key'] = serviceApiKey;
      }
    }
    
    return headers;
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<{ projects?: any[]; total?: number; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/projects`, { headers });
      return { projects: response.data.projects, total: response.data.total };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get projects',
      };
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: number): Promise<{ project?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/projects/${projectId}`, { headers });
      return { project: response.data.project };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get project',
      };
    }
  }

  /**
   * Create project
   */
  async createProject(data: {
    name: string;
    type?: string;
    industry?: string;
    teamSize?: string;
    timeline?: string;
    budget?: number;
    startDate?: string;
    endDate?: string;
    document?: string;
  }): Promise<{ project?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(`/api/projects`, data, { headers });
      return { project: response.data.project };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to create project',
      };
    }
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: number,
    data: {
      name?: string;
      type?: string;
      industry?: string;
      teamSize?: string;
      timeline?: string;
      budget?: number;
      startDate?: string;
      endDate?: string;
      status?: string;
      score?: number;
      riskLevel?: string;
      document?: string;
      analysisData?: string;
    }
  ): Promise<{ project?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.put(`/api/projects/${projectId}`, data, { headers });
      return { project: response.data.project };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to update project',
      };
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: number): Promise<{ error?: string }> {
    try {
      const headers = await this.getHeaders();
      await this.client.delete(`/api/projects/${projectId}`, { headers });
      return {};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to delete project',
      };
    }
  }

  /**
   * Get project statistics
   */
  async getStats(): Promise<{ stats?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/projects/stats`, { headers });
      return { stats: response.data.stats };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get stats',
      };
    }
  }

  /**
   * Get templates
   */
  async getTemplates(isPublic?: boolean): Promise<{ templates?: any[]; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const params = isPublic !== undefined ? { public: isPublic.toString() } : {};
      const response = await this.client.get(`/api/projects/templates`, { headers, params });
      return { templates: response.data.templates };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get templates',
      };
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: number): Promise<{ template?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.get(`/api/projects/templates/${templateId}`, { headers });
      return { template: response.data.template };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to get template',
      };
    }
  }

  /**
   * Create project from template
   */
  async createFromTemplate(
    templateId: number,
    overrides?: Record<string, any>
  ): Promise<{ project?: any; error?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await this.client.post(
        `/api/projects/from-template`,
        { templateId, ...overrides },
        { headers }
      );
      return { project: response.data.project };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || error.message || 'Failed to create project from template',
      };
    }
  }
}

export const projectService = new ProjectServiceClient();

