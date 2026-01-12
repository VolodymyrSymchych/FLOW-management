import { Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { AuthenticatedRequest, UnauthorizedError } from '@project-scope-analyzer/shared';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = await jwtService.verifyToken(token);

    req.userId = payload.userId;
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role || 'user',
    };

    _next();
  } catch (error) {
    _next(error);
  }
}

// Optional auth middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await jwtService.verifyToken(token);
        req.userId = payload.userId;
        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role || 'user',
        };
      } catch (error) {
        // Ignore invalid tokens in optional auth
      }
    }

    _next();
  } catch (error) {
    _next(error);
  }
}

