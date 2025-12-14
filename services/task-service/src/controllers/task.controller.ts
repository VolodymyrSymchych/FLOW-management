import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskService, UpdateTaskInput } from '../services/task.service';
import { ValidationError, NotFoundError, ForbiddenError, AuthenticatedRequest } from '@project-scope-analyzer/shared';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  projectId: z.number().int().positive().optional(),
  assignee: z.string().max(100).optional(),
  startDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  dueDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  status: z.string().max(50).optional(),
  priority: z.string().max(50).optional(),
  dependsOn: z.array(z.number().int().positive()).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  parentId: z.number().int().positive().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  projectId: z.number().int().positive().optional().nullable(),
  assignee: z.string().max(100).optional().nullable(),
  startDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  dueDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  status: z.string().max(50).optional(),
  priority: z.string().max(50).optional(),
  dependsOn: z.array(z.number().int().positive()).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
  parentId: z.number().int().positive().optional().nullable(),
});

export class TaskController {
  /**
   * GET /tasks
   * Get all tasks for current user
   * Query params: projectId (optional) - filter by project, teamId (optional) - filter by team
   */
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const userId = req.userId;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;

      let tasks;
      if (teamId) {
        tasks = await taskService.getTasksByTeam(userId, teamId);
      } else {
        tasks = await taskService.getUserTasks(userId, projectId);
      }

      res.json({ tasks, total: tasks.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:id
   * Get task by ID
   */
  async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const userId = req.userId;
      const task = await taskService.getTaskById(taskId, userId);

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      res.json({ task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:id/subtasks
   * Get subtasks for a task
   */
  async getSubtasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      // Verify task exists and user has access
      const userId = req.userId;
      const task = await taskService.getTaskById(taskId, userId);
      if (!task) {
        throw new NotFoundError('Task not found');
      }

      const subtasks = await taskService.getSubtasks(taskId);

      res.json({ subtasks, total: subtasks.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:id/dependencies
   * Get task dependencies
   */
  async getDependencies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      // Verify task exists and user has access
      const userId = req.userId;
      const task = await taskService.getTaskById(taskId, userId);
      if (!task) {
        throw new NotFoundError('Task not found');
      }

      const dependencies = await taskService.getDependencies(taskId);

      res.json({ dependencies, total: dependencies.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/gantt
   * Get Gantt chart data
   */
  async getGanttData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const userId = req.userId;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;

      const tasks = await taskService.getGanttData(userId, projectId);

      res.json({ tasks, total: tasks.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks
   * Create a new task
   */
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const validation = createTaskSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const userId = req.userId;
      const task = await taskService.createTask(userId, validation.data);

      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/:id/subtasks
   * Create a subtask
   */
  async createSubtask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const parentId = parseInt(req.params.id, 10);
      if (isNaN(parentId)) {
        throw new ValidationError('Invalid parent task ID');
      }

      // Verify parent task exists and user has access
      const userId = req.userId;
      const parentTask = await taskService.getTaskById(parentId, userId);
      if (!parentTask) {
        throw new NotFoundError('Parent task not found');
      }

      const validation = createTaskSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const task = await taskService.createTask(userId, {
        ...validation.data,
        parentId,
        projectId: validation.data.projectId || parentTask.projectId || undefined,
      });

      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /tasks/:id
   * Update task
   */
  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const validation = updateTaskSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const userId = req.userId;
      // Convert null to undefined for optional fields
      const updateData: UpdateTaskInput = {
        ...(validation.data.title !== undefined && { title: validation.data.title }),
        ...(validation.data.description !== undefined && { description: validation.data.description }),
        ...(validation.data.projectId !== null && validation.data.projectId !== undefined && { projectId: validation.data.projectId }),
        ...(validation.data.parentId !== null && validation.data.parentId !== undefined && { parentId: validation.data.parentId }),
        ...(validation.data.assignee !== null && validation.data.assignee !== undefined && { assignee: validation.data.assignee }),
        ...(validation.data.startDate !== undefined && { startDate: validation.data.startDate }),
        ...(validation.data.dueDate !== undefined && { dueDate: validation.data.dueDate }),
        ...(validation.data.endDate !== undefined && { endDate: validation.data.endDate }),
        ...(validation.data.status !== undefined && { status: validation.data.status }),
        ...(validation.data.priority !== undefined && { priority: validation.data.priority }),
        ...(validation.data.dependsOn !== null && validation.data.dependsOn !== undefined && { dependsOn: validation.data.dependsOn }),
        ...(validation.data.progress !== undefined && { progress: validation.data.progress }),
      };
      const task = await taskService.updateTask(taskId, userId, updateData);

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      res.json({ task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:id
   * Delete task (soft delete)
   */
  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new ValidationError('Invalid task ID');
      }

      const userId = req.userId;
      const deleted = await taskService.deleteTask(taskId, userId);

      if (!deleted) {
        throw new NotFoundError('Task not found');
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();

