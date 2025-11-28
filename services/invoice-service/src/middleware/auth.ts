import { Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { UnauthorizedError } from '@project-scope-analyzer/shared';
import { AuthenticatedRequest } from '../types/express';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = await jwtService.verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role || 'user',
    };

    next();
  } catch (error) {
    next(error);
  }
}

// Optional auth middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await jwtService.verifyToken(token);
        req.user = {
          userId: payload.userId,
          email: payload.email,
          username: payload.username,
          role: payload.role || 'user',
        };
      } catch (error) {
        // Ignore invalid tokens in optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
