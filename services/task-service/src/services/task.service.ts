import { db, tasks } from '../db';
import { eq, and, isNull, desc, or, inArray, sql } from 'drizzle-orm';
import { logger } from '@project-scope-analyzer/shared';

export interface Task {
  id: number;
  projectId: number | null;
  userId: number | null;
  parentId: number | null;
  title: string;
  description: string | null;
  assignee: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  endDate: Date | null;
  status: string;
  priority: string;
  dependsOn: string | null; // JSON array
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId?: number;
  assignee?: string;
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  dependsOn?: number[];
  progress?: number;
  parentId?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  projectId?: number;
  assignee?: string;
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  dependsOn?: number[];
  progress?: number;
  parentId?: number;
}

export interface WorkedHours {
  taskId: number;
  totalHours: number;
  totalMinutes: number;
  entryCount: number;
}

export class TaskService {
  /**
   * Get tasks for a user
   */
  async getUserTasks(userId: number, projectId?: number): Promise<Task[]> {
    try {
      const conditions = [
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
      ];

      if (projectId) {
        conditions.push(eq(tasks.projectId, projectId));
      }

      const userTasks = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt));

      return userTasks.map(this.mapToTask);
    } catch (error) {
      logger.error('Error getting user tasks', { error, userId, projectId });
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: number, userId?: number): Promise<Task | null> {
    try {
      const conditions = [eq(tasks.id, taskId), isNull(tasks.deletedAt)];
      
      if (userId) {
        conditions.push(eq(tasks.userId, userId));
      }

      const [task] = await db
        .select()
        .from(tasks)
        .where(and(...conditions));

      if (!task) {
        return null;
      }

      return this.mapToTask(task);
    } catch (error) {
      logger.error('Error getting task by ID', { error, taskId, userId });
      throw error;
    }
  }

  /**
   * Get subtasks for a task
   */
  async getSubtasks(taskId: number): Promise<Task[]> {
    try {
      const subtasks = await db
        .select()
        .from(tasks)
        .where(and(
          eq(tasks.parentId, taskId),
          isNull(tasks.deletedAt)
        ))
        .orderBy(desc(tasks.createdAt));

      return subtasks.map(this.mapToTask);
    } catch (error) {
      logger.error('Error getting subtasks', { error, taskId });
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(userId: number, input: CreateTaskInput): Promise<Task> {
    try {
      const result = await db
        .insert(tasks)
        .values({
          userId,
          projectId: input.projectId || null,
          parentId: input.parentId || null,
          title: input.title,
          description: input.description || null,
          assignee: input.assignee || null,
          startDate: input.startDate || null,
          dueDate: input.dueDate || null,
          endDate: input.endDate || null,
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          dependsOn: input.dependsOn ? JSON.stringify(input.dependsOn) : null,
          progress: input.progress || 0,
        })
        .returning();
      const newTask = result[0];

      return this.mapToTask(newTask);
    } catch (error) {
      logger.error('Error creating task', { error, userId, input });
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId: number, userId: number, input: UpdateTaskInput): Promise<Task | null> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.projectId !== undefined) updateData.projectId = input.projectId;
      if (input.assignee !== undefined) updateData.assignee = input.assignee;
      if (input.startDate !== undefined) updateData.startDate = input.startDate;
      if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
      if (input.endDate !== undefined) updateData.endDate = input.endDate;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.dependsOn !== undefined) {
        updateData.dependsOn = input.dependsOn ? JSON.stringify(input.dependsOn) : null;
      }
      if (input.progress !== undefined) updateData.progress = input.progress;
      if (input.parentId !== undefined) updateData.parentId = input.parentId;

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(and(
          eq(tasks.id, taskId),
          eq(tasks.userId, userId),
          isNull(tasks.deletedAt)
        ))
        .returning();

      if (!updatedTask) {
        return null;
      }

      return this.mapToTask(updatedTask);
    } catch (error) {
      logger.error('Error updating task', { error, taskId, userId, input });
      throw error;
    }
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    try {
      const [deletedTask] = await db
        .update(tasks)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(tasks.id, taskId),
          eq(tasks.userId, userId),
          isNull(tasks.deletedAt)
        ))
        .returning();

      return !!deletedTask;
    } catch (error) {
      logger.error('Error deleting task', { error, taskId, userId });
      throw error;
    }
  }

  /**
   * Get task dependencies
   */
  async getDependencies(taskId: number): Promise<Task[]> {
    try {
      const task = await this.getTaskById(taskId);
      if (!task || !task.dependsOn) {
        return [];
      }

      const dependencyIds = JSON.parse(task.dependsOn) as number[];
      if (dependencyIds.length === 0) {
        return [];
      }

      const dependencyTasks = await db
        .select()
        .from(tasks)
        .where(and(
          inArray(tasks.id, dependencyIds),
          isNull(tasks.deletedAt)
        ));

      return dependencyTasks.map(this.mapToTask);
    } catch (error) {
      logger.error('Error getting dependencies', { error, taskId });
      throw error;
    }
  }

  /**
   * Get Gantt chart data
   */
  async getGanttData(userId: number, projectId?: number): Promise<Task[]> {
    try {
      const userTasks = await this.getUserTasks(userId, projectId);
      
      // Filter tasks with dates for Gantt chart
      return userTasks.filter(task => task.startDate || task.dueDate);
    } catch (error) {
      logger.error('Error getting Gantt data', { error, userId, projectId });
      throw error;
    }
  }

  private mapToTask(row: any): Task {
    return {
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      parentId: row.parentId,
      title: row.title,
      description: row.description,
      assignee: row.assignee,
      startDate: row.startDate,
      dueDate: row.dueDate,
      endDate: row.endDate,
      status: row.status,
      priority: row.priority,
      dependsOn: row.dependsOn,
      progress: row.progress,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

export const taskService = new TaskService();

