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
  const checks = {
    database: true, // TODO: Check database connection
    redis: true, // TODO: Check redis connection
  };

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

