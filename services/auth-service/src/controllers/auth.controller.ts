import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { jwtService } from '../services/jwt.service';
import { emailService } from '../services/email.service';
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

      // Publish verification requested event
      // @ts-ignore - Event type mismatch due to shared lib version
      publishEvent({
        type: 'user.verification_requested',
        email: user.email,
        name: user.fullName || user.username,
        token: verificationToken,
        timestamp: new Date(),
      });
      await emailService.sendVerificationEmail(user.email, verificationToken, user.fullName || user.username);

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
        // verificationToken, // Don't return verification token to client
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

  async resendVerificationEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await authService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        res.json({ success: true, message: 'If the email exists, a verification link has been sent.' });
        return;
      }

      if (user.emailVerified) {
        res.json({ success: true, message: 'Email already verified' });
        return;
      }

      const verificationToken = await authService.createEmailVerification(user.id, user.email);

      // Publish verification resend event
      // @ts-ignore - Event type mismatch due to shared lib version
      publishEvent({
        type: 'user.verification_resend',
        email: user.email,
        name: user.fullName || user.username,
        token: verificationToken,
        timestamp: new Date(),
      });

      res.json({ success: true, message: 'Verification email sent successfully' });
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

  async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await authService.getUserByEmail(email);
      if (user) {
        const redis = getRedisClient();
        const token = await authService.createPasswordResetToken(user.email, redis);

        // Publish password reset requested event
        // @ts-ignore - Event type mismatch due to shared lib version
        publishEvent({
          type: 'user.password_reset_requested',
          email: user.email,
          name: user.fullName || user.username,
          token,
          timestamp: new Date(),
        });

        // Also send email directly as fallback (for Vercel where notification-service might not be running)
        try {
          await emailService.sendPasswordResetEmail(user.email, user.fullName || user.username, token);
        } catch (emailError) {
          logger.error('Failed to send password reset email directly', { emailError });
          // Don't throw - event bus might still handle it
        }
      }

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token) {
        throw new ValidationError('Token is required');
      }

      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        throw new ValidationError('Invalid password', {
          errors: passwordValidation.error.errors,
        });
      }

      const redis = getRedisClient();
      const user = await authService.resetPassword(token, password, redis);

      // Publish password reset success event
      // @ts-ignore - Event type mismatch due to shared lib version
      publishEvent({
        type: 'user.password_changed',
        userId: user.id,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

