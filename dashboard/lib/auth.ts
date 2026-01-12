import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Validate JWT_SECRET is set (only at runtime, not during build)
const getJWTSecret = () => {
  if (!process.env.JWT_SECRET) {
    // During build time, use a placeholder
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    // Return a placeholder for build time
    return 'build-time-placeholder-secret-min-32-chars-long';
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return process.env.JWT_SECRET;
};

const JWT_SECRET = new TextEncoder().encode(getJWTSecret());

// Reduced session duration for better security (1 hour instead of 7 days)
const SESSION_DURATION = 60 * 60; // 1 hour
const SESSION_DURATION_REMEMBER_ME = 7 * 24 * 60 * 60; // 7 days
const REFRESH_THRESHOLD = 15 * 60; // Refresh if token expires in less than 15 minutes

export interface SessionData {
  userId: number;
  email: string;
  username: string;
  fullName?: string | null;
}

export async function createSession(data: SessionData, rememberMe: boolean = false) {
  // Use same issuer as microservices for compatibility
  const JWT_ISSUER = process.env.JWT_ISSUER || 'project-scope-analyzer';

  const sessionDuration = rememberMe ? SESSION_DURATION_REMEMBER_ME : SESSION_DURATION;
  const expirationTime = rememberMe ? '7d' : '1h';

  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setIssuer(JWT_ISSUER) // Add issuer claim for microservice compatibility
    .sign(JWT_SECRET);

  const cookieStore = await cookies();

  // Determine if we're in production (Vercel)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production (Vercel uses HTTPS)
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility with Vercel
    maxAge: sessionDuration,
    path: '/',
    // Don't set domain - let browser handle it automatically for better compatibility
  });

  return token;
}

export async function getSession(autoRefresh: boolean = true): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    const JWT_ISSUER = process.env.JWT_ISSUER || 'project-scope-analyzer';
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER, // Verify issuer claim matches
    });

    if (!payload.userId || !payload.email || !payload.username) {
      return null;
    }

    const sessionData = {
      userId: payload.userId as number,
      email: payload.email as string,
      username: payload.username as string,
      fullName: payload.fullName as string | null | undefined,
    };

    // Auto-refresh token if it's close to expiration (silent refresh)
    if (autoRefresh && payload.exp) {
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh if token expires in less than REFRESH_THRESHOLD
      if (timeUntilExpiry < REFRESH_THRESHOLD * 1000) {
        await createSession(sessionData);
      }
    }

    return sessionData;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function requireAuth(request?: NextRequest): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
