import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { getBeams, getUserBeamsId } from '../utils/beams';
import { z } from 'zod';

const _beamsAuthSchema = z.object({
  userId: z.string().optional(),
});

export class BeamsController {
  // Beams user authentication endpoint
  async auth(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;

    // Convert user ID to Beams format
    const beamsUserId = getUserBeamsId(user.userId);

    // Get Beams instance
    const beams = getBeams();

    try {
      // Generate Beams token for this user
      const beamsToken = beams.generateToken(beamsUserId);

      res.json(beamsToken);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate Beams token',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const beamsController = new BeamsController();
