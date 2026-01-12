import { Router } from 'express';
import { db } from '../../db';
import { tasks } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest, logger } from '@project-scope-analyzer/shared';

const router = Router();

const LOCK_TIMEOUT_MINUTES = 15; // Lock expires after 15 minutes

/**
 * GET /api/tasks/:id/lock
 * Check if task is locked
 */
router.get('/:id/lock', async (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const taskId = parseInt(authenticatedReq.params.id);
    const userId = authenticatedReq.user!.id;

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: {
        id: true,
        lockedBy: true,
        lockedAt: true,
        lockedByEmail: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if lock has expired
    const now = new Date();
    const lockExpired = task.lockedAt
      ? new Date(task.lockedAt).getTime() + LOCK_TIMEOUT_MINUTES * 60 * 1000 < now.getTime()
      : true;

    const isLocked = task.lockedBy && !lockExpired && task.lockedBy !== userId;

    res.json({
      isLocked,
      lockedBy: isLocked ? task.lockedByEmail : null,
      lockedAt: isLocked ? task.lockedAt : null,
      canEdit: !isLocked,
    });
  } catch (error: unknown) {
    logger.error('Check lock error:', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message || 'Failed to check lock' });
  }
});

/**
 * POST /api/tasks/:id/lock
 * Acquire lock on task
 */
router.post('/:id/lock', async (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const taskId = parseInt(authenticatedReq.params.id);
    const userId = authenticatedReq.user!.id;
    const userEmail = authenticatedReq.user!.email || 'Unknown';

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: {
        id: true,
        lockedBy: true,
        lockedAt: true,
        lockedByEmail: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if already locked by someone else
    const now = new Date();
    const lockExpired = task.lockedAt
      ? new Date(task.lockedAt).getTime() + LOCK_TIMEOUT_MINUTES * 60 * 1000 < now.getTime()
      : true;

    if (task.lockedBy && !lockExpired && task.lockedBy !== userId) {
      return res.status(409).json({
        error: 'Task is locked by another user',
        lockedBy: task.lockedByEmail,
        lockedAt: task.lockedAt,
      });
    }

    // Acquire lock
    await db
      .update(tasks)
      .set({
        lockedBy: userId,
        lockedAt: now,
        lockedByEmail: userEmail,
      })
      .where(eq(tasks.id, taskId));

    res.json({
      success: true,
      lockedBy: userId,
      lockedAt: now,
    });
  } catch (error: unknown) {
    logger.error('Acquire lock error:', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message || 'Failed to acquire lock' });
  }
});

/**
 * DELETE /api/tasks/:id/lock
 * Release lock on task
 */
router.delete('/:id/lock', async (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const taskId = parseInt(authenticatedReq.params.id);
    const userId = authenticatedReq.user!.id;

    // Release lock only if owned by current user
    await db
      .update(tasks)
      .set({
        lockedBy: null,
        lockedAt: null,
        lockedByEmail: null,
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.lockedBy, userId)
        )
      );

    res.json({ success: true });
  } catch (error: unknown) {
    logger.error('Release lock error:', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message || 'Failed to release lock' });
  }
});

export default router;
