import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '@project-scope-analyzer/shared';
import { getRedisClient } from '../utils/redis';

interface RateLimitOptions {
  limit: number;
  window: number; // in seconds
  identifier?: (req: Request) => string;
  message?: string;
}

export function rateLimit(options: RateLimitOptions) {
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

