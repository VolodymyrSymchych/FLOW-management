import { Router, Request, Response } from 'express';

const router = Router();

router.get('/metrics', (req: Request, res: Response) => {
  const metrics = {
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };

  res.json(metrics);
});

export default router;
