import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { config } from '../config';
import { UnauthorizedError, logger, getRedisClient } from '@project-scope-analyzer/shared';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(config.jwt.secret);

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  role?: string;
}

export class JWTService {
  async createToken(payload: JWTPayload): Promise<string> {
    const expiresIn = config.jwt.expiresIn || '1h';

    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role || 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setIssuer(config.jwt.issuer)
      .sign(JWT_SECRET);

    return token;
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token has been revoked');
      }

      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: config.jwt.issuer,
      });

      if (!payload.userId || !payload.email || !payload.username) {
        throw new UnauthorizedError('Invalid token payload');
      }

      return {
        userId: payload.userId as number,
        email: payload.email as string,
        username: payload.username as string,
        role: payload.role as string,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Add token to blacklist (for logout functionality)
   * Token will be blocked until its natural expiration
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (!redis) {
        // If Redis is unavailable, we can't blacklist tokens
        // This is a limitation of stateless JWT with Redis blacklist
        return;
      }

      // Decode token to get expiration time (without verifying signature)
      const payload = decodeJwt(token);
      if (!payload.exp) {
        return; // Token without expiration can't be blacklisted with TTL
      }

      // Calculate TTL (time until token expires)
      const now = Math.floor(Date.now() / 1000);
      const ttl = payload.exp - now;

      if (ttl <= 0) {
        // Token already expired, no need to blacklist
        return;
      }

      // Create a hash of the token to use as key (tokens are long)
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const key = `blacklist:token:${tokenHash}`;

      // Store in Redis with TTL matching token expiration
      await redis.setex(key, ttl, '1');
    } catch (error) {
      // Log error but don't throw - logout should succeed even if blacklist fails
      logger.error('Failed to blacklist token', { error });
    }
  }

  /**
   * Check if token is in blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      if (!redis) {
        return false; // If Redis is unavailable, allow the token
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const key = `blacklist:token:${tokenHash}`;

      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Failed to check token blacklist', { error });
      return false; // On error, allow the token (fail open)
    }
  }
}

export const jwtService = new JWTService();

