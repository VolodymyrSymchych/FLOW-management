import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Reduced session duration for better security (1 hour instead of 7 days)
const SESSION_DURATION = 60 * 60; // 1 hour
const REFRESH_THRESHOLD = 15 * 60; // Refresh if token expires in less than 15 minutes

export interface SessionData {
  userId: number;
  email: string;
  username: string;
  fullName?: string | null;
}

export async function createSession(data: SessionData) {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Reduced from 7d to 1h
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  
  // Determine if we're in production (Vercel)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production (Vercel uses HTTPS)
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility with Vercel
    maxAge: SESSION_DURATION,
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
    const { payload } = await jwtVerify(token, JWT_SECRET);

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
