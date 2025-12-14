import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance with credentials enabled
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface ProjectMetadata {
  project_name: string;
  project_type: string;
  industry: string;
  team_size: string;
  timeline: string;
}

export interface AnalyzeRequest extends ProjectMetadata {
  document: string;
  quick?: boolean;
}

export interface Project {
  id: number;
  name: string;
  userId?: number;
  type?: string | null;
  industry?: string | null;
  teamSize?: string | null;
  team_size?: string | null;
  timeline?: string | null;
  budget?: number | null;
  startDate?: string | null;
  start_date?: string | null;
  endDate?: string | null;
  end_date?: string | null;
  score?: number | null;
  riskLevel?: string | null;
  risk_level?: string | null;
  status: string;
  document?: string | null;
  analysisData?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isOwner?: boolean;
  isTeamProject?: boolean;
  translations?: Record<string, any>;
}

export interface Stats {
  projects_in_progress: number;
  total_projects: number;
  completion_rate: number;
  projects_completed: number;
  trends?: {
    projects_in_progress?: {
      value: number;
      isPositive: boolean;
    };
    total_projects?: {
      value: number;
      isPositive: boolean;
    };
  };
}

export const api = {
  // Health check
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Get all projects
  getProjects: async (teamId?: number | 'all'): Promise<{ projects: Project[]; total: number }> => {
    const url = teamId !== undefined
      ? `/projects?team_id=${teamId}`
      : '/projects';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get specific project
  getProject: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Analyze project
  analyzeProject: async (data: AnalyzeRequest) => {
    const response = await apiClient.post('/analyze', data);
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get stats
  getStats: async (): Promise<Stats> => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  // Get progress
  getProgress: async (projectId: number) => {
    const response = await apiClient.get(`/projects/${projectId}/progress`);
    return response.data;
  },
};
