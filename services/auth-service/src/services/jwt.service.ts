import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config';
import { UnauthorizedError } from '@project-scope-analyzer/shared';

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
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export const jwtService = new JWTService();

