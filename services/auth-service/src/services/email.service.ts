import { logger } from '@project-scope-analyzer/shared';

export class EmailService {
    async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
        const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        // In a real application, you would use a transactional email provider like SendGrid, AWS SES, etc.
        // For now, we'll log the email to the console.

        logger.info('📧 SENDING VERIFICATION EMAIL 📧');
        logger.info(`To: ${name} <${email}>`);
        logger.info(`Subject: Verify your email address`);
        logger.info(`Link: ${verificationUrl}`);
        logger.info('--------------------------------------------------');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

export const emailService = new EmailService();
