import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { storage } from '../../../../../server/storage';
import { createSession } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { getRedisClient } from '@/lib/redis';
import { loginSchema } from '@/lib/validations';

// Account lockout settings
const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds

async function checkAccountLockout(email: string): Promise<{ locked: boolean; remainingTime?: number }> {
  const redis = getRedisClient();
  if (!redis) return { locked: false };

  try {
    const key = `account-lockout:${email.toLowerCase()}`;
    const attempts = await redis.get(key);

    if (attempts && parseInt(attempts as string) >= MAX_LOGIN_ATTEMPTS) {
      const ttl = 'ttl' in redis ? await (redis as any).ttl(key) : 0;
      return { locked: true, remainingTime: ttl > 0 ? ttl : 0 };
    }

    return { locked: false };
  } catch (error) {
    console.error('Error checking account lockout:', error);
    return { locked: false };
  }
}

async function recordFailedLogin(email: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `account-lockout:${email.toLowerCase()}`;
    const attempts = await (redis as any).incr(key);

    // Set expiration on first attempt
    if (attempts === 1 && 'expire' in redis) {
      await (redis as any).expire(key, LOCKOUT_DURATION);
    }
  } catch (error) {
    console.error('Error recording failed login:', error);
  }
}

async function clearFailedLogins(email: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `account-lockout:${email.toLowerCase()}`;
    await redis.del(key);
  } catch (error) {
    console.error('Error clearing failed logins:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 login attempts per 5 minutes per IP
    const rateLimitResult = await withRateLimit(request, {
      limit: 5,
      window: 300, // 5 minutes
      identifier: (req) => {
        const ip = req.headers.get('x-forwarded-for') ||
                   req.headers.get('x-real-ip') ||
                   'anonymous';
        return `login:${ip}`;
      },
    });

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse({
      email: body.emailOrUsername,
      password: body.password
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { email: emailOrUsername, password } = validation.data;

    let user = await storage.getUserByEmail(emailOrUsername);
    if (!user) {
      user = await storage.getUserByUsername(emailOrUsername);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked due to too many failed attempts
    const lockoutStatus = await checkAccountLockout(user.email);
    if (lockoutStatus.locked) {
      const minutes = Math.ceil((lockoutStatus.remainingTime || 0) / 60);
      return NextResponse.json(
        {
          error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutes} minute(s).`
        },
        { status: 429 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid login method' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Record failed login attempt
      await recordFailedLogin(user.email);

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clear failed login attempts on successful login
    await clearFailedLogins(user.email);

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
