import { Response, NextFunction } from 'express';
import { teamService } from '../services/team.service';
import { ValidationError, AuthenticatedRequest } from '@project-scope-analyzer/shared';

export class TeamController {
  /**
   * Get all teams for current user
   */
  async getTeams(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const teams = await teamService.getUserTeams(userId);
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.userId;

      const team = await teamService.getTeamById(teamId, userId);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new team
   */
  async createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const { name, description } = req.body;

      if (!name) {
        throw new ValidationError('Team name is required');
      }

      const team = await teamService.createTeam({
        name,
        description,
        ownerId: userId,
      });

      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update team
   */
  async updateTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const { name, description } = req.body;

      const team = await teamService.updateTeam(teamId, userId, {
        name,
        description,
      });

      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete team
   */
  async deleteTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      await teamService.deleteTeam(teamId, userId);
      res.json({ success: true, message: 'Team deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.userId;

      const members = await teamService.getTeamMembers(teamId, userId);
      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add team member
   */
  async addTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const { userId: memberUserId, role } = req.body;

      if (!memberUserId) {
        throw new ValidationError('Member user ID is required');
      }

      const member = await teamService.addTeamMember(
        teamId,
        userId,
        Number(memberUserId),
        role
      );

      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const memberUserId = parseInt(req.params.userId);
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      await teamService.removeTeamMember(teamId, userId, memberUserId);
      res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update team member role
   */
  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = parseInt(req.params.id);
      const memberUserId = parseInt(req.params.userId);
      const userId = req.userId;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const { role } = req.body;

      if (!role) {
        throw new ValidationError('Role is required');
      }

      const member = await teamService.updateMemberRole(
        teamId,
        userId,
        memberUserId,
        role
      );

      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();
