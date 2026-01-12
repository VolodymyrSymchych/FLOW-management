import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { projectService, CreateProjectInput } from '../services/project.service';
import { ValidationError, NotFoundError, ForbiddenError, AuthenticatedRequest } from '@project-scope-analyzer/shared';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  teamSize: z.string().max(50).optional(),
  timeline: z.string().max(100).optional(),
  budget: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  document: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  teamSize: z.string().max(50).optional(),
  timeline: z.string().max(100).optional(),
  budget: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  status: z.string().max(50).optional(),
  score: z.number().int().min(0).max(100).optional(),
  riskLevel: z.string().max(50).optional(),
  document: z.string().optional(),
  analysisData: z.string().optional(),
});

export class ProjectController {
  /**
   * GET /projects
   * Get all projects for current user
   * Query params: teamId (optional) - filter by team
   */
  async getProjects(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const userId = req.userId;
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;

      const projects = teamId
        ? await projectService.getProjectsByTeam(userId, teamId)
        : await projectService.getUserProjects(userId);

      res.json({ projects, total: projects.length });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * GET /projects/:id
   * Get project by ID
   */
  async getProject(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const projectId = parseInt(req.params.id, 10);
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const userId = req.userId;
      const project = await projectService.getProjectById(projectId, userId);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      res.json({ project });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * POST /projects
   * Create a new project
   */
  async createProject(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const validation = createProjectSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const userId = req.userId;
      const project = await projectService.createProject(userId, validation.data as CreateProjectInput);

      res.status(201).json({ project });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * PUT /projects/:id
   * Update project
   */
  async updateProject(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const projectId = parseInt(req.params.id, 10);
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const validation = updateProjectSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const userId = req.userId;
      const project = await projectService.updateProject(projectId, userId, validation.data);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      res.json({ project });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * DELETE /projects/:id
   * Delete project (soft delete)
   */
  async deleteProject(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const projectId = parseInt(req.params.id, 10);
      if (isNaN(projectId)) {
        throw new ValidationError('Invalid project ID');
      }

      const userId = req.userId;
      const deleted = await projectService.deleteProject(projectId, userId);

      if (!deleted) {
        throw new NotFoundError('Project not found');
      }

      res.json({ success: true });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * GET /projects/:id/stats
   * Get project statistics
   */
  async getProjectStats(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const userId = req.userId;
      const stats = await projectService.getProjectStats(userId);

      res.json({ stats });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * GET /projects/templates
   * Get all project templates
   */
  async getTemplates(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const isPublic = req.query.public === 'true' ? true : req.query.public === 'false' ? false : undefined;
      const templates = await projectService.getTemplates(isPublic);

      res.json({ templates });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * GET /projects/templates/:id
   * Get template by ID
   */
  async getTemplate(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const templateId = parseInt(req.params.id, 10);
      if (isNaN(templateId)) {
        throw new ValidationError('Invalid template ID');
      }

      const template = await projectService.getTemplateById(templateId);
      if (!template) {
        throw new NotFoundError('Template not found');
      }

      res.json({ template });
    } catch (error) {
      _next(error);
    }
  }

  /**
   * POST /projects/from-template
   * Create project from template
   */
  async createFromTemplate(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw new ForbiddenError('Unauthorized');
      }

      const { templateId, ...overrides } = req.body;

      if (!templateId || isNaN(parseInt(templateId, 10))) {
        throw new ValidationError('Template ID is required');
      }

      const userId = req.userId;
      const project = await projectService.createProjectFromTemplate(
        userId,
        parseInt(templateId, 10),
        overrides
      );

      res.status(201).json({ project });
    } catch (error) {
      _next(error);
    }
  }
}

export const projectController = new ProjectController();

