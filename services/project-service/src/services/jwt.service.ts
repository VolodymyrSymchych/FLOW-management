import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config';
import { logger } from '@project-scope-analyzer/shared';

const JWT_SECRET = new TextEncoder().encode(config.jwt.secret);

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  role?: string;
  [key: string]: unknown;
}

export class JWTService {
  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: config.jwt.issuer,
      });

      if (!payload.userId || !payload.email || !payload.username) {
        throw new Error('Invalid token payload');
      }

      return {
        userId: typeof payload.userId === 'string' ? parseInt(payload.userId, 10) : payload.userId as number,
        email: payload.email as string,
        username: payload.username as string,
        role: payload.role as string,
      };
    } catch (error) {
      logger.error('JWT verification failed', { error });
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Create JWT token
   */
  async createToken(payload: JWTPayload): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(config.jwt.expiresIn)
      .setIssuer(config.jwt.issuer)
      .sign(JWT_SECRET);

    return token;
  }
}

export const jwtService = new JWTService();

