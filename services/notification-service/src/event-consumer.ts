import { createEventBus, type IEventBus, type EventMetadata } from '@project-scope-analyzer/shared';
import type {
    UserVerificationRequestedEvent,
    UserVerificationResendEvent,
    UserPasswordResetRequestedEvent,
} from '@project-scope-analyzer/shared';
import { config } from './config';
import { logger } from '@project-scope-analyzer/shared';
import { emailService } from './services/email.service';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Connect to event bus with exponential backoff retry
 */
async function connectWithRetry(bus: IEventBus): Promise<void> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            await bus.connect();
            logger.info('Event bus connected successfully', {
                service: config.service.name,
                attempt: attempt + 1
            });
            return;
        } catch (error) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            logger.warn('Event bus connection failed, retrying...', {
                attempt: attempt + 1,
                maxRetries: MAX_RETRIES,
                delayMs: delay,
                error
            });

            if (attempt < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`Failed to connect to event bus after ${MAX_RETRIES} attempts`);
}

export async function startEventConsumer() {
    try {
        const bus = createEventBus(config.service.name, config.eventBus.type as 'redis' | 'rabbitmq');
        await connectWithRetry(bus);

        logger.info('Event consumer connected', { service: config.service.name });

        // Subscribe to verification requested event
        bus.subscribe<UserVerificationRequestedEvent>(
            'user.verification_requested',
            async (event: UserVerificationRequestedEvent, _metadata: EventMetadata) => {
                const { email, name, token } = event;
                logger.info('Processing verification email request', { email });
                await emailService.sendVerificationEmail(email, name, token);
            }
        );

        // Subscribe to verification resend event
        bus.subscribe<UserVerificationResendEvent>(
            'user.verification_resend',
            async (event: UserVerificationResendEvent, _metadata: EventMetadata) => {
                const { email, name, token } = event;
                logger.info('Processing verification email resend', { email });
                await emailService.sendVerificationEmail(email, name, token);
            }
        );

        // Subscribe to password reset requested event
        bus.subscribe<UserPasswordResetRequestedEvent>(
            'user.password_reset_requested',
            async (event: UserPasswordResetRequestedEvent, _metadata: EventMetadata) => {
                const { email, name, token } = event;
                logger.info('Processing password reset email', { email });
                await emailService.sendPasswordResetEmail(email, name, token);
            }
        );

        logger.info('Event subscriptions set up successfully');
    } catch (error) {
        logger.error('Failed to start event consumer', { error });
        // In production, you might want to trigger an alert or graceful shutdown
    }
}

