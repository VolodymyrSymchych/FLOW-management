import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { db, users, emailVerifications, type User, type InsertUser } from '../db';
import { logger, RedisWrapper } from '@project-scope-analyzer/shared';
import { NotFoundError, ValidationError, ConflictError, UnauthorizedError } from '@project-scope-analyzer/shared';
import Redis from 'ioredis';

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

  async checkAccountLockout(email: string, redis: Redis | RedisWrapper | null): Promise<{ locked: boolean; remainingTime?: number }> {
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

  async recordFailedLogin(email: string, redis: Redis | RedisWrapper | null): Promise<void> {
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

  async clearFailedLogins(email: string, redis: Redis | RedisWrapper | null): Promise<void> {
    if (!redis) return;

    try {
      const key = `account-lockout:${email.toLowerCase()}`;
      await redis.del(key);
    } catch (error) {
      logger.error('Error clearing failed logins', { error, email });
    }
  }
}

export const authService = new AuthService();

