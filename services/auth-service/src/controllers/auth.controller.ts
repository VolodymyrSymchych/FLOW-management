import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { jwtService } from '../services/jwt.service';
import { ValidationError, UnauthorizedError, ForbiddenError, getRedisClient, AuthenticatedRequest } from '@project-scope-analyzer/shared';
import { publishEvent } from '../event-bus';
import { logger } from '@project-scope-analyzer/shared';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(255).optional(),
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  async signup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', {
          errors: validation.error.errors,
        });
      }

      const { email, username, password, name: fullName } = validation.data;

      const user = await authService.createUser({
        email,
        username,
        password,
        fullName: fullName || null,
        provider: 'local',
        emailVerified: false,
        isActive: true,
        role: 'user',
      });

      const verificationToken = await authService.createEmailVerification(user.id, user.email);

      const token = await jwtService.createToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      // Publish event (non-blocking)
      publishEvent({
        type: 'user.registered',
        userId: user.id,
        email: user.email,
        username: user.username,
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
        },
        token,
        verificationToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Email/username and password are required');
      }

      const { emailOrUsername, password } = validation.data;

      let user = await authService.getUserByEmail(emailOrUsername);
      if (!user) {
        user = await authService.getUserByUsername(emailOrUsername);
      }

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check account lockout
      const redis = getRedisClient();
      const lockoutStatus = await authService.checkAccountLockout(user.email, redis);
      if (lockoutStatus.locked) {
        const minutes = Math.ceil((lockoutStatus.remainingTime || 0) / 60);
        res.status(429).json({
          error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutes} minute(s).`,
        });
        return;
      }

      if (!user.password) {
        throw new UnauthorizedError('Invalid login method');
      }

      const isPasswordValid = await authService.verifyPassword(user, password);
      if (!isPasswordValid) {
        await authService.recordFailedLogin(user.email, redis);
        throw new UnauthorizedError('Invalid credentials');
      }

      // Clear failed login attempts
      await authService.clearFailedLogins(user.email, redis);

      if (!user.isActive) {
        throw new ForbiddenError('Account is disabled');
      }

      const token = await jwtService.createToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      // Publish event (non-blocking)
      publishEvent({
        type: 'user.logged_in',
        userId: user.id,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;

      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Add token to blacklist so it can't be used again
        await jwtService.blacklistToken(token);
      }

      if (userId) {
        publishEvent({
          type: 'user.logged_out',
          userId,
          timestamp: new Date(),
        });
      }

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      const user = await authService.verifyEmail(token);

      // Publish event (non-blocking)
      publishEvent({
        type: 'user.verified',
        userId: user.id,
        email: user.email,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Not authenticated');
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          role: user.role,
          preferredLocale: user.preferredLocale,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLocale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Not authenticated');
      }

      const { locale } = req.body;
      if (!locale || !['en', 'uk'].includes(locale)) {
        throw new ValidationError('Invalid locale. Supported locales: en, uk');
      }

      const user = await authService.updateUser(userId, {
        preferredLocale: locale,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          preferredLocale: user.preferredLocale,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

