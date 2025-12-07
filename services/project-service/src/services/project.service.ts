import { db, projects, projectTemplates } from '../db';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { logger } from '@project-scope-analyzer/shared';

export interface Project {
  id: number;
  userId: number;
  teamId: number | null;
  name: string;
  type: string | null;
  industry: string | null;
  teamSize: string | null;
  timeline: string | null;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  score: number;
  riskLevel: string | null;
  status: string;
  document: string | null;
  analysisData: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateProjectInput {
  name: string;
  teamId?: number;
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
  score?: number;
  riskLevel?: string;
  document?: string;
  analysisData?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  averageScore: number;
  projectsByStatus: Record<string, number>;
  projectsByType: Record<string, number>;
}

export class ProjectService {
  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: number): Promise<Project[]> {
    try {
      const userProjects = await db()
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
        .orderBy(desc(projects.createdAt));

      return userProjects.map(this.mapToProject);
    } catch (error) {
      logger.error('Error getting user projects', { error, userId });
      throw error;
    }
  }

  /**
   * Get projects by team ID for a user
   */
  async getProjectsByTeam(userId: number, teamId: number): Promise<Project[]> {
    try {
      const teamProjects = await db()
        .select()
        .from(projects)
        .where(and(
          eq(projects.userId, userId),
          eq(projects.teamId, teamId),
          isNull(projects.deletedAt)
        ))
        .orderBy(desc(projects.createdAt));

      return teamProjects.map(this.mapToProject);
    } catch (error) {
      logger.error('Error getting team projects', { error, userId, teamId });
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: number, userId?: number): Promise<Project | null> {
    try {
      const conditions = [eq(projects.id, projectId), isNull(projects.deletedAt)];

      if (userId) {
        conditions.push(eq(projects.userId, userId));
      }

      const [project] = await db()
        .select()
        .from(projects)
        .where(and(...conditions));

      if (!project) {
        return null;
      }

      return this.mapToProject(project);
    } catch (error) {
      logger.error('Error getting project by ID', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(userId: number, input: CreateProjectInput): Promise<Project> {
    try {
      const [newProject] = await db()
        .insert(projects)
        .values({
          userId,
          teamId: input.teamId || null,
          name: input.name,
          type: input.type || null,
          industry: input.industry || null,
          teamSize: input.teamSize || null,
          timeline: input.timeline || null,
          budget: input.budget || null,
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          document: input.document || null,
          status: 'in_progress',
        })
        .returning();

      return this.mapToProject(newProject);
    } catch (error) {
      logger.error('Error creating project', { error, userId, input });
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: number, userId: number, input: UpdateProjectInput): Promise<Project | null> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.industry !== undefined) updateData.industry = input.industry;
      if (input.teamSize !== undefined) updateData.teamSize = input.teamSize;
      if (input.timeline !== undefined) updateData.timeline = input.timeline;
      if (input.budget !== undefined) updateData.budget = input.budget;
      if (input.startDate !== undefined) updateData.startDate = input.startDate;
      if (input.endDate !== undefined) updateData.endDate = input.endDate;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.score !== undefined) updateData.score = input.score;
      if (input.riskLevel !== undefined) updateData.riskLevel = input.riskLevel;
      if (input.document !== undefined) updateData.document = input.document;
      if (input.analysisData !== undefined) updateData.analysisData = input.analysisData;

      const [updatedProject] = await db()
        .update(projects)
        .set(updateData)
        .where(and(
          eq(projects.id, projectId),
          eq(projects.userId, userId),
          isNull(projects.deletedAt)
        ))
        .returning();

      if (!updatedProject) {
        return null;
      }

      return this.mapToProject(updatedProject);
    } catch (error) {
      logger.error('Error updating project', { error, projectId, userId, input });
      throw error;
    }
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId: number, userId: number): Promise<boolean> {
    try {
      const [deletedProject] = await db()
        .update(projects)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(projects.id, projectId),
          eq(projects.userId, userId),
          isNull(projects.deletedAt)
        ))
        .returning();

      return !!deletedProject;
    } catch (error) {
      logger.error('Error deleting project', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Get project statistics for a user
   */
  async getProjectStats(userId: number): Promise<ProjectStats> {
    try {
      const userProjects = await db()
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));

      const totalProjects = userProjects.length;
      const activeProjects = userProjects.filter(p => p.status === 'in_progress').length;
      const completedProjects = userProjects.filter(p => p.status === 'completed').length;
      const totalBudget = userProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const averageScore = userProjects.length > 0
        ? userProjects.reduce((sum, p) => sum + (p.score || 0), 0) / userProjects.length
        : 0;

      const projectsByStatus: Record<string, number> = {};
      const projectsByType: Record<string, number> = {};

      userProjects.forEach(project => {
        projectsByStatus[project.status] = (projectsByStatus[project.status] || 0) + 1;
        if (project.type) {
          projectsByType[project.type] = (projectsByType[project.type] || 0) + 1;
        }
      });

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        averageScore: Math.round(averageScore * 100) / 100,
        projectsByStatus,
        projectsByType,
      };
    } catch (error) {
      logger.error('Error getting project stats', { error, userId });
      throw error;
    }
  }

  /**
   * Get all project templates
   */
  async getTemplates(isPublic?: boolean): Promise<any[]> {
    try {
      const conditions = [];
      if (isPublic !== undefined) {
        conditions.push(eq(projectTemplates.isPublic, isPublic));
      }

      const templates = await db()
        .select()
        .from(projectTemplates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(projectTemplates.usageCount));

      return templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        templateData: JSON.parse(template.templateData),
        isPublic: template.isPublic,
        createdBy: template.createdBy,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      }));
    } catch (error) {
      logger.error('Error getting templates', { error, isPublic });
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: number): Promise<any | null> {
    try {
      const [template] = await db()
        .select()
        .from(projectTemplates)
        .where(eq(projectTemplates.id, templateId));

      if (!template) {
        return null;
      }

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        templateData: JSON.parse(template.templateData),
        isPublic: template.isPublic,
        createdBy: template.createdBy,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };
    } catch (error) {
      logger.error('Error getting template by ID', { error, templateId });
      throw error;
    }
  }

  /**
   * Create project from template
   */
  async createProjectFromTemplate(
    userId: number,
    templateId: number,
    overrides?: Partial<CreateProjectInput>
  ): Promise<Project> {
    try {
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const templateData = template.templateData;
      const projectInput: CreateProjectInput = {
        name: overrides?.name || templateData.name || 'New Project',
        type: overrides?.type || templateData.type,
        industry: overrides?.industry || templateData.industry,
        teamSize: overrides?.teamSize || templateData.teamSize,
        timeline: overrides?.timeline || templateData.timeline,
        budget: overrides?.budget || templateData.budget,
        startDate: overrides?.startDate || (templateData.startDate ? new Date(templateData.startDate) : undefined),
        endDate: overrides?.endDate || (templateData.endDate ? new Date(templateData.endDate) : undefined),
        document: overrides?.document || templateData.document,
      };

      const project = await this.createProject(userId, projectInput);

      // Increment template usage count
      await db()
        .update(projectTemplates)
        .set({
          usageCount: sql`${projectTemplates.usageCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(projectTemplates.id, templateId));

      return project;
    } catch (error) {
      logger.error('Error creating project from template', { error, userId, templateId, overrides });
      throw error;
    }
  }

  private mapToProject(row: any): Project {
    return {
      id: row.id,
      userId: row.userId,
      teamId: row.teamId || null,
      name: row.name,
      type: row.type,
      industry: row.industry,
      teamSize: row.teamSize,
      timeline: row.timeline,
      budget: row.budget,
      startDate: row.startDate,
      endDate: row.endDate,
      score: row.score || 0,
      riskLevel: row.riskLevel,
      status: row.status,
      document: row.document,
      analysisData: row.analysisData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

export const projectService = new ProjectService();

