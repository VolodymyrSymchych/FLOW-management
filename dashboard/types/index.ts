/**
 * Shared type definitions for the dashboard
 */

export interface Project {
  id: number;
  name: string;
  type?: string;
  industry?: string;
  team_size?: string;
  timeline?: string;
  status?: string;
  score?: number;
  risk_level?: string;
  created_at?: string;
  isOwner?: boolean;
  isTeamProject?: boolean;
  team_id?: number;
  budget?: number;
  start_date?: string | null;
  end_date?: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  assignee: string | null;
  start_date?: string | null;
  due_date: string | null;
  end_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  userId?: number | null;
  parent_task_id?: number | null;
  parentId?: number | null;
  progress?: number;
  dependsOn?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isOwner?: boolean;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: 'owner' | 'admin' | 'member';
  joinedAt?: string;
  user?: {
    id: number;
    email: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
  };
}
