import { Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { AuthenticatedRequest } from '@project-scope-analyzer/shared';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Debug logging
    console.log('[Auth Middleware] Request to:', req.path);
    console.log('[Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('[Auth Middleware] All headers:', JSON.stringify(req.headers, null, 2));

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    console.log('[Auth Middleware] Token extracted, length:', token.length);

    const payload = await jwtService.verifyToken(token);
    console.log('[Auth Middleware] Token verified successfully for user:', payload.userId);

    req.userId = payload.userId;
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role || 'user',
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Authentication failed:', error);
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
