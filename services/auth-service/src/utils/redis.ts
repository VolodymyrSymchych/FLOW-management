import IORedis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { config } from '../config';

// Union type for both Redis clients
type RedisClient = IORedis | UpstashRedis | null;

let redisClient: RedisClient = null;

// Wrapper to make Upstash Redis compatible with ioredis API
class RedisWrapper {
  private upstash: UpstashRedis;

  constructor(upstash: UpstashRedis) {
    this.upstash = upstash;
  }

  async get(key: string): Promise<string | null> {
    const result = await this.upstash.get(key);
    return result ? String(result) : null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.upstash.set(key, value);
  }

  async incr(key: string): Promise<number> {
    return await this.upstash.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.upstash.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.upstash.ttl(key);
  }

  async del(key: string): Promise<void> {
    await this.upstash.del(key);
  }

  async ping(): Promise<string> {
    return await this.upstash.ping();
  }

  on(event: string, callback: (error?: any) => void): void {
    // Upstash doesn't support event listeners, but we can ignore this
  }
}

export function getRedisClient(): IORedis | RedisWrapper | null {
  if (redisClient) {
    return redisClient as IORedis | RedisWrapper;
  }

  try {
    // Try Upstash Redis first (for Vercel production)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const upstash = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const wrapper = new RedisWrapper(upstash);
      redisClient = wrapper as any;
      console.log('✓ Connected to Upstash Redis (REST API)');
      return wrapper;
    }

    // Support REDIS_URL connection string directly (for Upstash Redis protocol, etc.)
    if (process.env.REDIS_URL) {
      redisClient = new IORedis(process.env.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
      (redisClient as IORedis).on('error', (error) => {
        console.error('Redis connection error:', error);
      });
      console.log('✓ Connected to Redis via REDIS_URL');
      return redisClient as IORedis;
    }

    // Use individual config
    redisClient = new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    (redisClient as IORedis).on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    console.log('✓ Connected to Redis via individual config');
    return redisClient as IORedis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
}

