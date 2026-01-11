import { Request, Response, NextFunction } from 'express';
import { RateLimitError, getRedisClient } from '@project-scope-analyzer/shared';

interface RateLimitOptions {
  limit: number;
  window: number; // in seconds
  identifier?: (req: Request) => string;
  message?: string;
}

export function rateLimit(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  const { limit, window, identifier, message } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedisClient();
      if (!redis) {
        // If Redis is not available, allow the request
        next();
        return;
      }

      const key = identifier
        ? `ratelimit:${identifier(req)}`
        : `ratelimit:${req.ip}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, window);
      }

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count).toString());
      res.setHeader('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());

      if (count > limit) {
        throw new RateLimitError(message || 'Rate limit exceeded');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Pre-configured rate limiters for common auth operations

// Strict rate limiter for login attempts (prevents brute-force)
export const loginRateLimit = rateLimit({
  limit: 500, // 5 attempts
  window: 15 * 60, // 15 minutes
  identifier: (req) => `login:${req.ip}:${req.body.email || 'unknown'}`,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

// Moderate rate limiter for signup (prevents spam)
export const signupRateLimit = rateLimit({
  limit: 3, // 3 signups
  window: 60 * 60, // 1 hour
  identifier: (req) => `signup:${req.ip}`,
  message: 'Too many signup attempts. Please try again after 1 hour.',
});

// Rate limiter for email verification (prevents spam)
export const verifyEmailRateLimit = rateLimit({
  limit: 5, // 5 verification attempts
  window: 60 * 60, // 1 hour
  identifier: (req) => `verify:${req.ip}`,
  message: 'Too many verification attempts. Please try again after 1 hour.',
});

// Rate limiter for password reset requests
export const passwordResetRateLimit = rateLimit({
  limit: 3, // 3 reset requests
  window: 60 * 60, // 1 hour
  identifier: (req) => `reset:${req.ip}:${req.body.email || 'unknown'}`,
  message: 'Too many password reset attempts. Please try again after 1 hour.',
});

// General API rate limiter
export const generalApiRateLimit = rateLimit({
  limit: 100, // 100 requests
  window: 15 * 60, // 15 minutes
  identifier: (req) => `api:${req.ip}`,
  message: 'Too many API requests. Please try again later.',
});

