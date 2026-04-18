export interface Task {
  id: number;
  projectId?: number;
  userId?: number;
  parentId?: number;
  title: string;
  description?: string;
  assignee?: string;
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  status: string;
  priority: string;
  dependsOn?: string; // JSON array of task IDs
  progress: number; // 0-100 percentage
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateTaskInput {
  projectId?: number;
  userId?: number;
  parentId?: number;
  title: string;
  description?: string;
  assignee?: string;
  startDate?: Date;
  dueDate?: Date;
  status?: string;
  priority?: string;
  dependsOn?: string;
  progress?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignee?: string;
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  dependsOn?: string;
  progress?: number;
}

export interface TaskWithSubtasks extends Task {
  subtasks?: Task[];
}

