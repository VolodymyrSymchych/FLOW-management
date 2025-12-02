import { createEventBus, type IEventBus, type AppEvent } from '@project-scope-analyzer/shared';
import { config } from './config';
import { logger } from '@project-scope-analyzer/shared';
import { emailService } from './services/email.service';

export async function startEventConsumer() {
    try {
        // @ts-ignore - EventBusType mismatch due to shared lib version
        const bus = createEventBus(config.service.name, config.eventBus.type as any);
        await bus.connect();

        logger.info('Event consumer connected', { service: config.service.name });

        // Subscribe to verification requested event
        // @ts-ignore - Event type mismatch due to shared lib version
        await bus.subscribe('user.verification_requested', async (event: AppEvent) => {
            // @ts-ignore
            if (event.type === 'user.verification_requested') {
                // @ts-ignore
                const { email, name, token } = event;
                logger.info('Processing verification email request', { email });
                await emailService.sendVerificationEmail(email, name, token);
            }
        });

        // Subscribe to verification resend event
        // @ts-ignore - Event type mismatch due to shared lib version
        await bus.subscribe('user.verification_resend', async (event: AppEvent) => {
            // @ts-ignore
            if (event.type === 'user.verification_resend') {
                // @ts-ignore
                const { email, name, token } = event;
                logger.info('Processing verification email resend', { email });
                await emailService.sendVerificationEmail(email, name, token);
            }
        });

        // Subscribe to password reset requested event
        // @ts-ignore - Event type mismatch due to shared lib version
        await bus.subscribe('user.password_reset_requested', async (event: AppEvent) => {
            // @ts-ignore
            if (event.type === 'user.password_reset_requested') {
                // @ts-ignore
                const { email, name, token } = event;
                logger.info('Processing password reset email', { email });
                await emailService.sendPasswordResetEmail(email, name, token);
            }
        });

        logger.info('Event subscriptions set up successfully');
    } catch (error) {
        logger.error('Failed to start event consumer', { error });
        // Don't crash the service if event bus fails, just log it
        // In production, you might want to retry connection
    }
}
