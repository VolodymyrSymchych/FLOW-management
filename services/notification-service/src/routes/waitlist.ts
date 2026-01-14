import { Router, Request, Response } from 'express';
import { logger } from '@project-scope-analyzer/shared';
import { emailService } from '../services/email.service';
import { db } from '../db';
import { waitlist } from '../db/schema';

const router = Router();

/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     summary: Add email to waitlist
 *     tags: [Waitlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       201:
 *         description: Successfully added to waitlist
 *       400:
 *         description: Invalid email
 *       409:
 *         description: Email already on waitlist
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || typeof email !== 'string') {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }

        // Check if email already exists
        const existing = await db.query.waitlist.findFirst({
            where: (waitlist, { eq }) => eq(waitlist.email, email.toLowerCase()),
        });

        if (existing) {
            res.status(409).json({ error: 'Email already on waitlist' });
            return;
        }

        // Add to waitlist
        await db.insert(waitlist).values({
            email: email.toLowerCase(),
            createdAt: new Date(),
        });

        // Send welcome email
        try {
            await emailService.sendEmail({
                to: email,
                subject: '🚀 Welcome to Project Scope Analyzer Waitlist!',
                html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 32px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #00e5ff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                🚀 Project Scope Analyzer
              </h1>
            </div>
            
            <div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(138, 43, 226, 0.1)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
              <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #1a1a2e;">
                Welcome to the Waitlist! 🎉
              </h2>
              <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0;">
                Thank you for your interest in Project Scope Analyzer! You're now on the exclusive waitlist for our AI-powered project management platform.
              </p>
            </div>
            
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0; color: #1a1a2e;">
                What's Next?
              </h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
                  ✅ <strong>Early Access:</strong> You'll be among the first to try our platform
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
                  🎁 <strong>Special Offer:</strong> 50% off for the first 3 months
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
                  📅 <strong>Launch Date:</strong> March 2026
                </li>
                <li style="padding: 12px 0;">
                  💌 <strong>Updates:</strong> We'll keep you posted on our progress
                </li>
              </ul>
            </div>
            
            <div style="background: rgba(0, 229, 255, 0.05); border-left: 4px solid #00e5ff; padding: 20px; margin-bottom: 32px; border-radius: 8px;">
              <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0;">
                <strong>💡 Pro Tip:</strong> Follow us on social media for behind-the-scenes updates and sneak peeks of new features!
              </p>
            </div>
            
            <div style="text-align: center; padding-top: 32px; border-top: 1px solid rgba(0, 0, 0, 0.1);">
              <p style="font-size: 14px; color: #718096; margin: 0 0 16px 0;">
                Questions? Reply to this email or visit our website.
              </p>
              <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                © 2026 Project Scope Analyzer. All rights reserved.
              </p>
            </div>
          </div>
        `,
            });
        } catch (emailError) {
            logger.error('Failed to send welcome email', { error: emailError, email });
            // Don't fail the request if email fails
        }

        logger.info('Added email to waitlist', { email });
        res.status(201).json({
            message: 'Successfully added to waitlist',
            email: email.toLowerCase(),
        });
    } catch (error) {
        logger.error('Error adding to waitlist', { error });
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/waitlist/count:
 *   get:
 *     summary: Get waitlist count
 *     tags: [Waitlist]
 *     responses:
 *       200:
 *         description: Waitlist count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 */
router.get('/count', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await db.select().from(waitlist);
        res.json({ count: result.length });
    } catch (error) {
        logger.error('Error getting waitlist count', { error });
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
