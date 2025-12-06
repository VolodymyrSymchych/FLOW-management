import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db, users, emailVerifications, type User, type InsertUser } from '../db';
import { logger } from '@project-scope-analyzer/shared';
import { NotFoundError, ValidationError, ConflictError, UnauthorizedError } from '@project-scope-analyzer/shared';
import IORedis from 'ioredis';

// Type for Redis client (supports both ioredis and Upstash wrapper)
type RedisClient = IORedis | { get: (key: string) => Promise<string | null>; incr: (key: string) => Promise<number>; expire: (key: string, seconds: number) => Promise<void>; ttl: (key: string) => Promise<number>; del: (key: string) => Promise<void> } | null;

export class AuthService {
  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user || null;
  }

  async getUserByProvider(provider: string, providerId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
      .limit(1);
    return user || null;
  }

  async createUser(userData: Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Hash password if provided
    let hashedPassword = userData.password;
    if (hashedPassword) {
      hashedPassword = await bcrypt.hash(hashedPassword, 10);
    }

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword || null,
        updatedAt: new Date(),
      })
      .returning();

    logger.info('User created', { userId: user.id, email: user.email });
    return user;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async createEmailVerification(userId: number, email: string): Promise<string> {
    const { nanoid } = await import('nanoid');
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(emailVerifications).values({
      userId,
      email: email.toLowerCase(),
      token,
      expiresAt,
      verified: false,
    });

    return token;
  }

  async verifyEmail(token: string): Promise<User> {
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token))
      .limit(1);

    if (!verification) {
      throw new NotFoundError('Verification token', token);
    }

    if (verification.verified) {
      throw new ValidationError('Email already verified');
    }

    if (new Date() > verification.expiresAt) {
      throw new ValidationError('Verification token expired');
    }

    // Mark verification as verified
    await db
      .update(emailVerifications)
      .set({ verified: true })
      .where(eq(emailVerifications.id, verification.id));

    // Update user email verified status
    const [user] = await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, verification.userId))
      .returning();

    if (!user) {
      throw new NotFoundError('User', verification.userId.toString());
    }

    logger.info('Email verified', { userId: user.id, email: user.email });
    return user;
  }

  async updateUser(id: number, updates: Partial<Omit<InsertUser, 'id' | 'createdAt'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundError('User', id.toString());
    }

    return user;
  }

  async checkAccountLockout(email: string, redis: RedisClient): Promise<{ locked: boolean; remainingTime?: number }> {
    if (!redis) return { locked: false };

    try {
      const key = `account-lockout:${email.toLowerCase()}`;
      const attempts = await redis.get(key);
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '10', 10);

      if (attempts && parseInt(attempts) >= maxAttempts) {
        const ttl = await redis.ttl(key);
        return { locked: true, remainingTime: ttl > 0 ? ttl : 0 };
      }

      return { locked: false };
    } catch (error) {
      logger.error('Error checking account lockout', { error, email });
      return { locked: false };
    }
  }

  async recordFailedLogin(email: string, redis: RedisClient): Promise<void> {
    if (!redis) return;

    try {
      const key = `account-lockout:${email.toLowerCase()}`;
      const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || '1800', 10);
      const attempts = await redis.incr(key);

      if (attempts === 1) {
        await redis.expire(key, lockoutDuration);
      }
    } catch (error) {
      logger.error('Error recording failed login', { error, email });
    }
  }

  async clearFailedLogins(email: string, redis: RedisClient): Promise<void> {
    if (!redis) return;

    try {
      const key = `account-lockout:${email.toLowerCase()}`;
      await redis.del(key);
    } catch (error) {
      logger.error('Error clearing failed logins', { error, email });
    }
  }

  async createPasswordResetToken(email: string, redis: RedisClient): Promise<string> {
    if (!redis) {
      throw new Error('Redis client is required for password reset');
    }

    const { nanoid } = await import('nanoid');
    const token = nanoid(32);
    const key = `password-reset:${token}`;

    // Store email in Redis with 1 hour expiration
    // Support both ioredis and Upstash wrapper
    if ('setex' in redis && typeof redis.setex === 'function') {
      // Use setex for compatibility (ioredis and RedisWrapper both support it)
      await redis.setex(key, 3600, email.toLowerCase());
    } else if ('set' in redis && typeof redis.set === 'function') {
      // Fallback to set with options for ioredis if setex is missing (unlikely)
      await (redis as IORedis).set(key, email.toLowerCase(), 'EX', 3600);
    } else {
      throw new Error('Redis client implementation not supported for password reset');
    }

    return token;
  }

  async resetPassword(token: string, newPassword: string, redis: RedisClient): Promise<User> {
    if (!redis) {
      throw new Error('Redis client is required for password reset');
    }

    const key = `password-reset:${token}`;
    const email = await redis.get(key);

    if (!email) {
      throw new ValidationError('Invalid or expired password reset token');
    }

    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError('User', email);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.updateUser(user.id, {
      password: hashedPassword,
    });

    // Delete the token so it can't be used again
    await redis.del(key);

    return user;
  }

  async findOrCreateOAuthUser(profile: {
    email: string;
    name?: string;
    provider: string;
    providerId: string;
  }): Promise<User> {
    // 1. Try to find by provider + providerId
    const existingUser = await this.getUserByProvider(profile.provider, profile.providerId);
    if (existingUser) return existingUser;

    // 2. Try to find by email
    const userByEmail = await this.getUserByEmail(profile.email);
    if (userByEmail) {
      // If user exists, we link the provider information if it's missing
      if (!userByEmail.providerId) {
        const [updatedUser] = await db
          .update(users)
          .set({
            provider: profile.provider,
            providerId: profile.providerId,
            emailVerified: true, // OAuth implies verified email
            updatedAt: new Date(),
          })
          .where(eq(users.id, userByEmail.id))
          .returning();

        return updatedUser || userByEmail;
      }
      return userByEmail;
    }

    // 3. Create new user
    const { nanoid } = await import('nanoid');
    // Generate base username from name or email
    let baseUsername = profile.name
      ? profile.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      : profile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (baseUsername.length < 3) {
      baseUsername = `user${nanoid(4)}`;
    }

    let username = baseUsername;

    // Ensure username uniqueness
    let counter = 0;
    while (await this.getUserByUsername(username)) {
      counter++;
      username = `${baseUsername}${counter}`;
    }

    const [newUser] = await db.insert(users).values({
      email: profile.email.toLowerCase(),
      username,
      fullName: profile.name || null,
      provider: profile.provider,
      providerId: profile.providerId,
      emailVerified: true, // Trusted provider
      isActive: true,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    logger.info('User created via OAuth', { userId: newUser.id, provider: profile.provider });
    return newUser;
  }
}

export const authService = new AuthService();

