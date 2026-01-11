
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'service-template',
  });
});

router.get('/ready', async (req: Request, res: Response) => {
  // Add readiness checks here (database, redis, etc.)
  const checks: Record<string, boolean> = {
    database: false,
    redis: false,
  };

  // Check database connection with timeout
  try {
    const { pool } = await import('../db');
    const dbPool = pool();
    if (dbPool) {
      // Use Promise.race to add a timeout
      const queryPromise = dbPool.query('SELECT 1');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database check timeout')), 5000)
      );
      const result = await Promise.race([queryPromise, timeoutPromise]) as { rows?: unknown[] };
      checks.database = !!(result && result.rows && result.rows.length > 0);
    } else {
      checks.database = false;
    }
  } catch (error) {
    checks.database = false;
  }

  // Check redis connection with timeout
  try {
    const { getRedisClient } = await import('@project-scope-analyzer/shared');
    const redis = getRedisClient();
    if (redis) {
      // Use Promise.race to add a timeout
      const pingPromise = redis.ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis check timeout')), 3000)
      );
      await Promise.race([pingPromise, timeoutPromise]);
      checks.redis = true;
    }
  } catch (error) {
    checks.redis = false;
  }

  const isReady = Object.values(checks).every((check) => check === true);

  if (isReady) {
    res.json({
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

