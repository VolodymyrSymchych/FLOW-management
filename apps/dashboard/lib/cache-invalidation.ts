/**
 * Centralized cache invalidation module
 *
 * This module provides functions for invalidating cache entries when data changes.
 * It ensures that related cache keys are properly invalidated to maintain data consistency.
 */

import { invalidateCache } from './redis';
import {
  CacheKeys,
  getProjectInvalidationKeys,
  getTaskInvalidationKeys,
  getTeamInvalidationKeys,
  getCachePattern,
} from './cache-keys';

/**
 * Entity types that can be invalidated
 */
export type InvalidatableEntity =
  | 'project'
  | 'task'
  | 'team'
  | 'invoice'
  | 'expense'
  | 'chat'
  | 'notification'
  | 'file'
  | 'report'
  | 'user'
  | 'timeEntry';

/**
 * Metadata for cache invalidation
 */
export interface InvalidationMetadata {
  userId?: number;
  projectId?: number;
  teamId?: number;
  taskId?: number;
  [key: string]: any;
}

/**
 * Invalidate cache entries when an entity is created, updated, or deleted
 *
 * @example
 * ```typescript
 * // After updating a project
 * await invalidateOnUpdate('project', project.id, session.userId, { teamId: project.teamId });
 *
 * // After creating a task
 * await invalidateOnUpdate('task', task.id, session.userId, {
 *   projectId: task.projectId,
 *   teamId: teamId
 * });
 * ```
 */
export async function invalidateOnUpdate(
  entity: InvalidatableEntity,
  id: number,
  userId?: number,
  metadata?: InvalidationMetadata
): Promise<void> {
  const keysToInvalidate: string[] = [];

  switch (entity) {
    case 'project':
      keysToInvalidate.push(
        ...getProjectInvalidationKeys(id, userId, metadata?.teamId)
      );
      break;

    case 'task':
      keysToInvalidate.push(
        ...getTaskInvalidationKeys(
          id,
          userId,
          metadata?.projectId,
          metadata?.teamId
        )
      );
      break;

    case 'team':
      keysToInvalidate.push(...getTeamInvalidationKeys(id, userId));
      break;

    case 'invoice':
      keysToInvalidate.push(
        CacheKeys.invoice(id),
        getCachePattern(`invoice:${id}:`)
      );
      if (metadata?.projectId) {
        keysToInvalidate.push(
          CacheKeys.invoicesByProject(metadata.projectId),
          CacheKeys.statsByProject(metadata.projectId)
        );
      }
      if (userId) {
        keysToInvalidate.push(
          CacheKeys.invoicesByUser(userId),
          CacheKeys.statsByUser(userId),
          CacheKeys.cashflowByUser(userId),
          CacheKeys.cashflowForecast(userId)
        );
      }
      if (metadata?.teamId) {
        keysToInvalidate.push(
          CacheKeys.invoicesByTeam(metadata.teamId),
          CacheKeys.statsByTeam(metadata.teamId)
        );
      }
      break;

    case 'expense':
      keysToInvalidate.push(
        CacheKeys.expense(id),
        getCachePattern(`expense:${id}:`)
      );
      if (metadata?.projectId) {
        keysToInvalidate.push(
          CacheKeys.expensesByProject(metadata.projectId),
          CacheKeys.statsByProject(metadata.projectId)
        );
      }
      if (userId) {
        keysToInvalidate.push(
          CacheKeys.expensesByUser(userId),
          CacheKeys.statsByUser(userId),
          CacheKeys.cashflowByUser(userId),
          CacheKeys.cashflowCategories(userId)
        );
      }
      break;

    case 'chat':
      keysToInvalidate.push(
        CacheKeys.chat(id),
        CacheKeys.chatMessages(id)
      );
      if (userId) {
        keysToInvalidate.push(CacheKeys.chatsByUser(userId));
      }
      break;

    case 'notification':
      if (userId) {
        keysToInvalidate.push(CacheKeys.notificationsByUser(userId));
      }
      break;

    case 'file':
      keysToInvalidate.push(
        CacheKeys.file(id),
        getCachePattern(`file:${id}:`)
      );
      if (metadata?.projectId) {
        keysToInvalidate.push(CacheKeys.filesByProject(metadata.projectId));
      }
      if (metadata?.taskId) {
        keysToInvalidate.push(CacheKeys.filesByTask(metadata.taskId));
      }
      break;

    case 'report':
      keysToInvalidate.push(
        CacheKeys.report(id),
        getCachePattern(`report:${id}:`)
      );
      if (userId) {
        keysToInvalidate.push(CacheKeys.reportsByUser(userId));
      }
      if (metadata?.projectId) {
        keysToInvalidate.push(CacheKeys.reportsByProject(metadata.projectId));
      }
      break;

    case 'user':
      keysToInvalidate.push(
        CacheKeys.user(id),
        getCachePattern(`user:${id}:`),
        // Invalidate all user-related data
        CacheKeys.projectsByUser(id),
        CacheKeys.tasksByUser(id),
        CacheKeys.statsByUser(id),
        CacheKeys.teamsByUser(id),
        CacheKeys.invoicesByUser(id),
        CacheKeys.expensesByUser(id),
        CacheKeys.chatsByUser(id),
        CacheKeys.notificationsByUser(id),
        CacheKeys.cashflowByUser(id)
      );
      break;

    case 'timeEntry':
      if (metadata?.taskId) {
        keysToInvalidate.push(
          CacheKeys.timeEntriesByTask(metadata.taskId),
          CacheKeys.taskHours(metadata.taskId),
          CacheKeys.task(metadata.taskId)
        );
      }
      if (userId) {
        keysToInvalidate.push(
          CacheKeys.timeEntriesByUser(userId),
          CacheKeys.statsByUser(userId)
        );
      }
      if (metadata?.teamId) {
        keysToInvalidate.push(
          CacheKeys.timeEntriesByTeam(metadata.teamId),
          CacheKeys.statsByTeam(metadata.teamId)
        );
      }
      break;

    default:
      console.warn(`[Cache Invalidation] Unknown entity type: ${entity}`);
      return;
  }

  // Remove duplicates
  const uniqueKeys = Array.from(new Set(keysToInvalidate));

  // Invalidate all keys in parallel for better performance
  console.log(`[Cache Invalidation] Invalidating ${uniqueKeys.length} keys for ${entity}:${id}`);
  await Promise.all(uniqueKeys.map(key => invalidateCache(key)));
}

/**
 * Invalidate all caches for a specific user
 * Use this when user data changes or user logs out
 */
export async function invalidateAllUserCaches(userId: number): Promise<void> {
  console.log(`[Cache Invalidation] Invalidating all caches for user ${userId}`);

  const keysToInvalidate = [
    CacheKeys.user(userId),
    CacheKeys.projectsByUser(userId),
    CacheKeys.tasksByUser(userId),
    CacheKeys.statsByUser(userId),
    CacheKeys.teamsByUser(userId),
    CacheKeys.invoicesByUser(userId),
    CacheKeys.expensesByUser(userId),
    CacheKeys.chatsByUser(userId),
    CacheKeys.notificationsByUser(userId),
    CacheKeys.reportsByUser(userId),
    CacheKeys.timeEntriesByUser(userId),
    CacheKeys.cashflowByUser(userId),
    CacheKeys.cashflowForecast(userId),
    CacheKeys.cashflowCategories(userId),
    getCachePattern(`tasks:user:${userId}:`), // tasks:user:123:project:*
  ];

  await Promise.all(keysToInvalidate.map(key => invalidateCache(key)));
}

/**
 * Invalidate all caches for a specific team
 * Use this when team data changes or team is deleted
 */
export async function invalidateAllTeamCaches(teamId: number): Promise<void> {
  console.log(`[Cache Invalidation] Invalidating all caches for team ${teamId}`);

  const keysToInvalidate = [
    CacheKeys.team(teamId),
    getCachePattern(`team:${teamId}:`),
    CacheKeys.projectsByTeam(teamId),
    CacheKeys.tasksByTeam(teamId),
    CacheKeys.invoicesByTeam(teamId),
    CacheKeys.statsByTeam(teamId),
    CacheKeys.timeEntriesByTeam(teamId),
  ];

  await Promise.all(keysToInvalidate.map(key => invalidateCache(key)));
}

/**
 * Invalidate all caches for a specific project
 * Use this when project is deleted
 */
export async function invalidateAllProjectCaches(
  projectId: number,
  userId?: number,
  teamId?: number
): Promise<void> {
  console.log(`[Cache Invalidation] Invalidating all caches for project ${projectId}`);

  const keysToInvalidate = [
    CacheKeys.project(projectId),
    getCachePattern(`project:${projectId}:`),
    CacheKeys.tasksByProject(projectId),
    CacheKeys.invoicesByProject(projectId),
    CacheKeys.expensesByProject(projectId),
    CacheKeys.filesByProject(projectId),
    CacheKeys.reportsByProject(projectId),
    CacheKeys.statsByProject(projectId),
  ];

  if (userId) {
    keysToInvalidate.push(
      CacheKeys.projectsByUser(userId),
      CacheKeys.statsByUser(userId)
    );
  }

  if (teamId) {
    keysToInvalidate.push(
      CacheKeys.projectsByTeam(teamId),
      CacheKeys.statsByTeam(teamId)
    );
  }

  await Promise.all(keysToInvalidate.map(key => invalidateCache(key)));
}

/**
 * Batch invalidate multiple entities at once
 * Useful for operations that affect multiple entities
 */
export async function batchInvalidate(
  operations: Array<{
    entity: InvalidatableEntity;
    id: number;
    userId?: number;
    metadata?: InvalidationMetadata;
  }>
): Promise<void> {
  console.log(`[Cache Invalidation] Batch invalidating ${operations.length} entities`);

  await Promise.all(operations.map(op => invalidateOnUpdate(op.entity, op.id, op.userId, op.metadata)));
}
