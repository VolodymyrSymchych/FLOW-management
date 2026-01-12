import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { teams, teamMembers, Team, InsertTeam, TeamMember } from '../db/schema';
import { NotFoundError, ForbiddenError, ValidationError } from '@project-scope-analyzer/shared';
import { logger } from '@project-scope-analyzer/shared';

export class TeamService {
  /**
   * Get all teams for a user (owned or member of)
   */
  async getUserTeams(userId: number): Promise<Team[]> {
    try {
      const userTeams = await db()
        .select({
          id: teams.id,
          name: teams.name,
          description: teams.description,
          ownerId: teams.ownerId,
          createdAt: teams.createdAt,
          updatedAt: teams.updatedAt,
        })
        .from(teams)
        .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
        .where(
          sql`${teams.ownerId} = ${userId} OR ${teamMembers.userId} = ${userId}`
        )
        .groupBy(teams.id);

      return userTeams;
    } catch (error) {
      logger.error('Failed to get user teams', { error, userId });
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: number, userId?: number): Promise<Team> {
    try {
      const [team] = await db()
        .select()
        .from(teams)
        .where(eq(teams.id, teamId));

      if (!team) {
        throw new NotFoundError('Team not found');
      }

      // Check if user has access (owner or member)
      if (userId) {
        const hasAccess = await this.checkUserAccess(teamId, userId);
        if (!hasAccess) {
          throw new ForbiddenError('You do not have access to this team');
        }
      }

      return team;
    } catch (error) {
      logger.error('Failed to get team', { error, teamId });
      throw error;
    }
  }

  /**
   * Create a new team
   */
  async createTeam(data: InsertTeam): Promise<Team> {
    try {
      const [team] = await db()
        .insert(teams)
        .values(data)
        .returning();

      logger.info('Team created', { teamId: team.id, ownerId: data.ownerId });
      return team;
    } catch (error) {
      logger.error('Failed to create team', { error, data });
      throw error;
    }
  }

  /**
   * Update team
   */
  async updateTeam(teamId: number, userId: number, data: Partial<InsertTeam>): Promise<Team> {
    try {
      const team = await this.getTeamById(teamId);

      if (team.ownerId !== userId) {
        throw new ForbiddenError('Only team owner can update team');
      }

      const [updatedTeam] = await db()
        .update(teams)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(teams.id, teamId))
        .returning();

      logger.info('Team updated', { teamId, userId });
      return updatedTeam;
    } catch (error) {
      logger.error('Failed to update team', { error, teamId, userId });
      throw error;
    }
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId: number, userId: number): Promise<void> {
    try {
      const team = await this.getTeamById(teamId);

      if (team.ownerId !== userId) {
        throw new ForbiddenError('Only team owner can delete team');
      }

      await db()
        .delete(teams)
        .where(eq(teams.id, teamId));

      logger.info('Team deleted', { teamId, userId });
    } catch (error) {
      logger.error('Failed to delete team', { error, teamId, userId });
      throw error;
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: number, userId?: number): Promise<TeamMember[]> {
    try {
      if (userId) {
        const hasAccess = await this.checkUserAccess(teamId, userId);
        if (!hasAccess) {
          throw new ForbiddenError('You do not have access to this team');
        }
      }

      const members = await db()
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId));

      return members;
    } catch (error) {
      logger.error('Failed to get team members', { error, teamId });
      throw error;
    }
  }

  /**
   * Add team member
   */
  async addTeamMember(teamId: number, userId: number, memberUserId: number, role: string = 'member'): Promise<TeamMember> {
    try {
      const team = await this.getTeamById(teamId);

      if (team.ownerId !== userId) {
        throw new ForbiddenError('Only team owner can add members');
      }

      // Check if user is already a member
      const [existingMember] = await db()
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, memberUserId)
          )
        );

      if (existingMember) {
        throw new ValidationError('User is already a member of this team');
      }

      const [member] = await db()
        .insert(teamMembers)
        .values({ teamId, userId: memberUserId, role })
        .returning();

      logger.info('Team member added', { teamId, memberUserId, role });
      return member;
    } catch (error) {
      logger.error('Failed to add team member', { error, teamId, memberUserId });
      throw error;
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(teamId: number, userId: number, memberUserId: number): Promise<void> {
    try {
      const team = await this.getTeamById(teamId);

      if (team.ownerId !== userId) {
        throw new ForbiddenError('Only team owner can remove members');
      }

      if (team.ownerId === memberUserId) {
        throw new ValidationError('Cannot remove team owner from team');
      }

      await db()
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, memberUserId)
          )
        );

      logger.info('Team member removed', { teamId, memberUserId });
    } catch (error) {
      logger.error('Failed to remove team member', { error, teamId, memberUserId });
      throw error;
    }
  }

  /**
   * Update team member role
   */
  async updateMemberRole(teamId: number, userId: number, memberUserId: number, role: string): Promise<TeamMember> {
    try {
      const team = await this.getTeamById(teamId);

      if (team.ownerId !== userId) {
        throw new ForbiddenError('Only team owner can update member roles');
      }

      const [updatedMember] = await db()
        .update(teamMembers)
        .set({ role })
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, memberUserId)
          )
        )
        .returning();

      if (!updatedMember) {
        throw new NotFoundError('Team member not found');
      }

      logger.info('Team member role updated', { teamId, memberUserId, role });
      return updatedMember;
    } catch (error) {
      logger.error('Failed to update member role', { error, teamId, memberUserId });
      throw error;
    }
  }

  /**
   * Check if user has access to team
   */
  private async checkUserAccess(teamId: number, userId: number): Promise<boolean> {
    const [team] = await db()
      .select()
      .from(teams)
      .where(eq(teams.id, teamId));

    if (!team) {
      return false;
    }

    if (team.ownerId === userId) {
      return true;
    }

    const [member] = await db()
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );

    return !!member;
  }
}

export const teamService = new TeamService();
