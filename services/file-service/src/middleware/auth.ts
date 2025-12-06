import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { UnauthorizedError } from '@project-scope-analyzer/shared';
import { config } from '../config';

const JWT_SECRET = new TextEncoder().encode(config.jwt.secret);

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: config.jwt.issuer,
      });

      req.userId = parseInt(payload.userId as string, 10);
      req.user = {
        id: req.userId,
        email: payload.email as string,
        role: payload.role as string,
      };

      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}

// Optional auth middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
          issuer: config.jwt.issuer,
        });

        req.userId = parseInt(payload.userId as string, 10);
        req.user = {
          id: req.userId,
          email: payload.email as string,
          role: payload.role as string,
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

