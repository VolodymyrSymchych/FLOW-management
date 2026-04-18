export interface Project {
  id: number;
  userId: number;
  name: string;
  type?: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  score?: number;
  riskLevel?: string;
  status: string;
  document?: string;
  analysisData?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateProjectInput {
  userId: number;
  name: string;
  type?: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  document?: string;
}

export interface UpdateProjectInput {
  name?: string;
  type?: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  document?: string;
  analysisData?: string;
}

export interface ProjectProgress {
  projectId: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  budgetUsed: number;
  budgetRemaining: number;
}

