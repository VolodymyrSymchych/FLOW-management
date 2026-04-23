import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

// Types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

/**
 * Cached data structure with timestamp for validation
 */
export interface CachedData<T> {
  data: T;
  cachedAt: number;  // Unix timestamp when data was cached
  metadata?: Record<string, any>;
}

/**
 * Options for cache validation
 */
export interface CacheValidationOptions {
  ttl?: number;              // Time to live in seconds (default: 300)
  validate?: boolean;         // Enable timestamp validation (default: false)
  getUpdatedAt?: () => Promise<Date | null>;  // Function to get last update time from DB
}

// Persist singleton + circuit state across HMR hot-reloads via globalThis
const _g = globalThis as unknown as {
  __redisClient: Redis | IORedis | null | undefined;
  __redisCircuitOpen: boolean | undefined;
  __redisCircuitResetAt: number | undefined;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Redis timeout after ${ms}ms`)), ms)
    ),
  ]);
}

function isCircuitClosed(): boolean {
  if (!_g.__redisCircuitOpen) return true;
  if (Date.now() >= (_g.__redisCircuitResetAt ?? 0)) {
    _g.__redisCircuitOpen = false;
    return true;
  }
  return false;
}

function tripCircuit(): void {
  _g.__redisCircuitOpen = true;
  // 5 minutes in dev (Redis likely not available), 30s in prod (transient failure)
  const resetMs = process.env.NODE_ENV === 'production' ? 30_000 : 300_000;
  _g.__redisCircuitResetAt = Date.now() + resetMs;
}

/**
 * Get Redis client instance (singleton)
 * Supports both Upstash Redis (for Vercel) and local Redis (for development)
 */
export function getRedisClient(): Redis | IORedis | null {
  if (_g.__redisClient !== undefined) {
    return _g.__redisClient;
  }

  try {
    // Try Upstash Redis first (for Vercel production)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      _g.__redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log('✓ Connected to Upstash Redis');
      return _g.__redisClient;
    }

    // Fallback to local Redis (for development)
    if (process.env.REDIS_URL) {
      _g.__redisClient = new IORedis(process.env.REDIS_URL);
      console.log('✓ Connected to local Redis');
      return _g.__redisClient;
    }

    console.warn('⚠ Redis not configured - caching disabled');
    _g.__redisClient = null;
    return null;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    _g.__redisClient = null;
    return null;
  }
}

/**
 * Cache wrapper with TTL support
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const redis = getRedisClient();
  const ttl = options.ttl || 300; // Default 5 minutes

  if (!redis || !isCircuitClosed()) {
    return fetcher();
  }

  try {
    // Try to get from cache (with 2s timeout to fail fast when Redis is unreachable)
    const cached = await withTimeout(redis.get(key), 2000);
    if (cached) {
      return (typeof cached === 'string' ? JSON.parse(cached) : cached) as T;
    }

    // Fetch and cache
    const data = await fetcher();

    // Set with TTL - handle both Upstash and IORedis
    try {
      if ('setex' in redis && typeof redis.setex === 'function') {
        await withTimeout((redis as any).setex(key, ttl, JSON.stringify(data)), 2000);
      } else {
        await withTimeout((redis as any).set(key, JSON.stringify(data), { ex: ttl }), 2000);
      }
    } catch (setError: any) {
      const errorMsg = setError?.message || setError?.toString() || String(setError);
      console.warn('Failed to cache data:', errorMsg);
      tripCircuit();
    }

    return data;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown cache error';
    console.error('Cache error:', errorMessage, error);
    tripCircuit();
    return fetcher();
  }
}

/**
 * Get data from cache only - returns null if cache miss (no DB fallback)
 * Use this for Redis-only data loading where DB fallback is not desired
 * 
 * @example
 * ```typescript
 * const stats = await getFromCacheOnly<Stats>('stats:user:123');
 * if (!stats) {
 *   // Handle cache miss - show empty state or trigger refresh
 * }
 * ```
 */
export async function getFromCacheOnly<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis || !isCircuitClosed()) {
    console.log(`[Cache] Redis not available, returning null for key: ${key}`);
    return null;
  }

  try {
    const cached = await withTimeout(redis.get(key), 2000);
    if (!cached) return null;

    const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
    if (parsed && typeof parsed === 'object' && 'data' in parsed && 'cachedAt' in parsed) {
      return parsed.data as T;
    }
    return parsed as T;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown cache error';
    console.error(`[Cache] Error reading cache-only for key: ${key}:`, errorMessage);
    tripCircuit();
    return null;
  }
}

/**
 * Advanced cache wrapper with timestamp validation
 *
 * Validates cached data against database timestamp to ensure freshness
 *
 * @example
 * ```typescript
 * const projects = await cachedWithValidation(
 *   'projects:user:123',
 *   () => storage.getUserProjects(123),
 *   {
 *     ttl: 300,
 *     validate: true,
 *     getUpdatedAt: async () => {
 *       const result = await db.select({ updatedAt: projects.updatedAt })
 *         .from(projects)
 *         .orderBy(desc(projects.updatedAt))
 *         .limit(1);
 *       return result[0]?.updatedAt || null;
 *     }
 *   }
 * );
 * ```
 */
export async function cachedWithValidation<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheValidationOptions = {}
): Promise<T> {
  const redis = getRedisClient();
  const ttl = options.ttl || 300; // Default 5 minutes
  const validate = options.validate !== false; // Default true

  if (!redis || !isCircuitClosed()) {
    return fetcher();
  }

  try {
    // Try to get from cache (with 2s timeout to fail fast when Redis is unreachable)
    const cachedRaw = await withTimeout(redis.get(key), 2000);

    if (cachedRaw) {
      const cachedData: CachedData<T> = typeof cachedRaw === 'string'
        ? JSON.parse(cachedRaw)
        : cachedRaw;

      // Check if we should validate timestamp
      if (validate && options.getUpdatedAt) {
        try {
          const dbUpdatedAt = await options.getUpdatedAt();
          if (dbUpdatedAt && dbUpdatedAt.getTime() > cachedData.cachedAt) {
            // stale — fall through to fetch fresh data
          } else {
            return cachedData.data;
          }
        } catch {
          return cachedData.data;
        }
      } else {
        return cachedData.data;
      }
    }

    // Cache miss or stale — fetch from database
    const data = await fetcher();

    // Wrap data with timestamp
    const cachedData: CachedData<T> = {
      data,
      cachedAt: Date.now(),
    };

    try {
      const serialized = JSON.stringify(cachedData);
      if ('setex' in redis && typeof redis.setex === 'function') {
        await withTimeout((redis as any).setex(key, ttl, serialized), 2000);
      } else {
        await withTimeout((redis as any).set(key, serialized, { ex: ttl }), 2000);
      }
    } catch (setError: any) {
      const errorMsg = setError?.message || setError?.toString() || String(setError);
      console.warn(`[Cache] Failed to store for key: ${key}:`, errorMsg);
      tripCircuit();
    }

    return data;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown cache error';
    console.error(`[Cache] Error for key: ${key}:`, errorMessage);
    tripCircuit();
    return fetcher();
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(keyPattern: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isCircuitClosed()) return;

  try {
    if ('keys' in redis && typeof redis.keys === 'function') {
      // IORedis
      const keys = await withTimeout((redis as any).keys(keyPattern), 2000) as string[];
      if (keys.length > 0) {
        await withTimeout((redis as any).del(...keys), 2000);
      }
    } else if ('del' in redis && typeof redis.del === 'function') {
      // Upstash - no keys() support, delete single key
      await withTimeout((redis as any).del(keyPattern), 2000);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
    tripCircuit();
  }
}

/**
 * Rate limiting using Redis
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const redis = getRedisClient();

  if (!redis) {
    // No rate limiting without Redis
    return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
  }

  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    // Use sorted set for sliding window
    if ('zremrangebyscore' in redis && typeof redis.zremrangebyscore === 'function') {
      // IORedis
      const ioredis = redis as any;
      await ioredis.zremrangebyscore(key, 0, windowStart);
      const count = await ioredis.zcard(key);

      if (count >= limit) {
        const oldest = await ioredis.zrange(key, 0, 0, 'WITHSCORES');
        const reset = oldest[1] ? parseInt(oldest[1] as string) + window * 1000 : now + window * 1000;
        return { success: false, remaining: 0, reset };
      }

      await ioredis.zadd(key, now, `${now}-${Math.random()}`);
      await ioredis.expire(key, window);

      return { success: true, remaining: limit - count - 1, reset: now + window * 1000 };
    } else {
      // Upstash - use simple counter with expire
      try {
        const upstash = redis as any;
        const count = await upstash.incr(key);

        // Set expire only on first increment
        if (count === 1) {
          await upstash.expire(key, window);
        }

        const success = count <= limit;
        return {
          success,
          remaining: Math.max(0, limit - count),
          reset: now + window * 1000
        };
      } catch (upstashError: any) {
        const errorMessage = upstashError?.message || upstashError?.toString() || 'Unknown error';
        console.error('Upstash rate limit error:', errorMessage);
        // Allow on error
        return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('Rate limit error:', errorMessage);
    // Allow on error
    return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
  }
}

/**
 * Session cache for JWT tokens
 */
export async function cacheSession(
  token: string,
  userId: number,
  ttl: number = 3600
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `session:${token}`;
    if ('setex' in redis && typeof redis.setex === 'function') {
      // IORedis - use setex
      await (redis as any).setex(key, ttl, userId.toString());
    } else if ('expire' in redis && typeof redis.expire === 'function') {
      // Upstash Redis - use set + expire separately
      await redis.set(key, userId.toString());
      await (redis as any).expire(key, ttl);
    } else {
      // Fallback - just set without TTL
      await redis.set(key, userId.toString());
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('Session cache error:', errorMessage);
  }
}

/**
 * Get cached session
 */
export async function getCachedSession(token: string): Promise<number | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = `session:${token}`;
    const userId = await redis.get(key);
    return userId ? parseInt(userId as string) : null;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

/**
 * Invalidate session cache
 */
export async function invalidateSession(token: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `session:${token}`;
    await redis.del(key);
  } catch (error) {
    console.error('Session invalidation error:', error);
  }
}

/**
 * Invalidate all user-related caches
 */
export async function invalidateUserCache(userId: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const patterns = [
      `projects:user:${userId}`,
      `tasks:user:${userId}*`,
      `stats:user:${userId}`,
      `teams:user:${userId}`, // Add teams cache
    ];

    await Promise.all(patterns.map((p) => invalidateCache(p)));
  } catch (error) {
    console.error('User cache invalidation error:', error);
  }
}

/**
 * Invalidate team-related caches
 */
export async function invalidateTeamCache(teamId: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const patterns = [
      `projects:team:${teamId}`,
      `tasks:team:${teamId}`,
    ];

    await Promise.all(patterns.map((p) => invalidateCache(p)));
  } catch (error) {
    console.error('Team cache invalidation error:', error);
  }
}
