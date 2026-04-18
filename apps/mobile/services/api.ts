import axios from 'axios';

const PROJECT_SERVICE_URL = process.env.EXPO_PUBLIC_PROJECT_SERVICE_URL || 'https://flow-project-service.vercel.app';
const PROJECT_SERVICE_API_KEY = process.env.EXPO_PUBLIC_PROJECT_SERVICE_API_KEY;

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

// Create axios instance with API key
const axiosInstance = axios.create({
  headers: PROJECT_SERVICE_API_KEY ? {
    'x-api-key': PROJECT_SERVICE_API_KEY,
  } : {},
});

export const api = {
  // Health check
  health: async () => {
    const response = await axiosInstance.get(`${PROJECT_SERVICE_URL}/health`);
    return response.data;
  },

  // Get all projects
  getProjects: async (teamId?: number | 'all'): Promise<{ projects: Project[]; total: number }> => {
    const url = teamId !== undefined && teamId !== 'all'
      ? `${PROJECT_SERVICE_URL}/api/projects?team_id=${teamId}`
      : `${PROJECT_SERVICE_URL}/api/projects`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Get specific project
  getProject: async (id: number) => {
    const response = await axiosInstance.get(`${PROJECT_SERVICE_URL}/api/projects/${id}`);
    return response.data;
  },

  // Analyze project
  analyzeProject: async (data: AnalyzeRequest) => {
    const response = await axiosInstance.post(`${PROJECT_SERVICE_URL}/api/analyze`, data);
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`${PROJECT_SERVICE_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get stats
  getStats: async (): Promise<Stats> => {
    const response = await axiosInstance.get(`${PROJECT_SERVICE_URL}/api/stats`);
    return response.data;
  },

  // Get progress
  getProgress: async (projectId: number) => {
    const response = await axiosInstance.get(`${PROJECT_SERVICE_URL}/api/projects/${projectId}/progress`);
    return response.data;
  },
};
