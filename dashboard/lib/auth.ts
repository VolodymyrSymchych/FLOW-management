import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Validate JWT_SECRET is set (only at runtime, not during build)
const getJWTSecret = () => {
  if (!process.env.JWT_SECRET) {
    // Return a placeholder for build time - validation happens at runtime
    return 'build-time-placeholder-secret-min-32-chars-long';
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn('JWT_SECRET should be at least 32 characters long');
  }

  return process.env.JWT_SECRET;
};

const JWT_SECRET = new TextEncoder().encode(getJWTSecret());

// Reduced session duration for better security (1 hour instead of 7 days)
const SESSION_DURATION = 60 * 60; // 1 hour
const SESSION_DURATION_REMEMBER_ME = 7 * 24 * 60 * 60; // 7 days
const REFRESH_THRESHOLD = 15 * 60; // Refresh if token expires in less than 15 minutes

// Short-lived in-memory cache to avoid repeated jwtVerify() for parallel requests
// (e.g. 5-10 API routes firing simultaneously on page load)
const SESSION_CACHE_TTL_MS = 5_000; // 5 seconds
const sessionCache = new Map<string, { data: SessionData; expiresAt: number }>();

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

  // Keep microservice auth in sync with dashboard session so a user
  // doesn't appear logged in locally while remote services see an expired token.
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: sessionDuration,
    path: '/',
  });

  return token;
}

export async function getSession(autoRefresh: boolean = true): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  // Check in-memory cache first to avoid redundant jwtVerify() calls
  // for parallel API requests hitting the server simultaneously
  const cacheKey = token.slice(-32); // Use last 32 chars as key (avoids storing sensitive data)
  const cached = sessionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
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

    // Store in in-memory cache
    sessionCache.set(cacheKey, { data: sessionData, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });

    // Periodically clean up expired entries to avoid memory leaks
    if (sessionCache.size > 500) {
      const now = Date.now();
      for (const [k, v] of sessionCache) {
        if (v.expiresAt <= now) sessionCache.delete(k);
      }
    }

    // Auto-refresh token if it's close to expiration (silent refresh)
    if (autoRefresh && payload.exp) {
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Detect if this session was created with "rememberMe" (7 days vs 1 hour)
      const expiresInSeconds = payload.exp - (payload.iat || 0);
      const isRememberMe = expiresInSeconds > 24 * 60 * 60; // if it lives longer than 1 day, it's remember me
      
      // If remember me is true, refresh if time until expiry is less than 3 days
      // If normal session (1 hour), refresh if time until expiry is less than REFRESH_THRESHOLD (15 mins)
      const thresholdMs = isRememberMe ? (3 * 24 * 60 * 60 * 1000) : (REFRESH_THRESHOLD * 1000);

      // Refresh if token expires in less than threshold
      if (timeUntilExpiry < thresholdMs) {
        await createSession(sessionData, isRememberMe);
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
  cookieStore.delete('auth_token');
}

export async function requireAuth(request?: NextRequest): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
