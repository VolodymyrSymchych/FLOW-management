import { logger } from '@project-scope-analyzer/shared';
import { createEventBus, type IEventBus } from '@project-scope-analyzer/shared';
import { startServer } from './app';
import { config } from './config';

export let eventBus: IEventBus | null = null;

async function main() {
  try {
    // Initialize event bus
    eventBus = createEventBus(config.service.name, config.eventBus.type);
    await eventBus.connect();

    logger.info('Event bus connected', { service: config.service.name });

    // Start server
    await startServer();

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully');
      if (eventBus) {
        await eventBus.disconnect();
      }
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start service', { error });
    process.exit(1);
  }
}

main();

