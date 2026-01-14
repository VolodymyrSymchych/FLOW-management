import { Router, Request, Response } from 'express';


import { pool } from '../db';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                 service:
 *                   type: string
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.json({
      status: 'healthy',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
