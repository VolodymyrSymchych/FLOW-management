import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'team-service',
  });
});

router.get('/ready', async (req: Request, res: Response) => {
  // Add readiness checks here (database, redis, etc.)
  const checks: Record<string, boolean> = {
    database: false,
    redis: false,
  };

  // Check database connection
  try {
    const { pool } = await import('../db');
    const poolInstance = pool();
    if (poolInstance) {
      const result = await poolInstance.query('SELECT 1');
      checks.database = result && result.rows && result.rows.length > 0;
    } else {
      checks.database = false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database check error:', message);
    checks.database = false;
  }

  // Check redis connection
  try {
    const { getRedisClient } = await import('@project-scope-analyzer/shared');
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
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
