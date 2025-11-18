import { logger } from '@project-scope-analyzer/shared';
import { createEventBus } from '@project-scope-analyzer/shared';
import { startServer } from './app';
import { config } from './config';

async function main() {
  try {
    // Initialize event bus
    const eventBus = createEventBus(config.service.name, config.eventBus.type);
    await eventBus.connect();

    // Subscribe to events if needed
    // eventBus.subscribe('event.type', async (event, metadata) => {
    //   logger.info('Event received', { eventType: event.type, metadata });
    // });

    // Start server
    await startServer();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await eventBus.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await eventBus.disconnect();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start service', { error });
    process.exit(1);
  }
}

main();

