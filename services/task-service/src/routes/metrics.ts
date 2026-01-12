import { Router, Request, Response } from 'express';
import { register } from '@project-scope-analyzer/shared';

const router = Router();

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

export default router;

