import { Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { AuthenticatedRequest, UnauthorizedError, logger } from '@project-scope-analyzer/shared';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Debug logging
    logger.debug('[Auth Middleware] Request to:', { path: req.path });
    logger.debug('[Auth Middleware] Authorization header:', { present: !!authHeader });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    logger.debug('[Auth Middleware] Token extracted', { length: token.length });

    const payload = await jwtService.verifyToken(token);
    logger.debug('[Auth Middleware] Token verified successfully', { userId: payload.userId });

    req.userId = payload.userId;
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role || 'user',
    };

    next();
  } catch (error) {
    logger.error('[Auth Middleware] Authentication failed', { error });
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

    next();
  } catch (error) {
    next(error);
  }
}
