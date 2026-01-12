import { logger } from '@project-scope-analyzer/shared';
import { startServer } from './app';


async function main(): Promise<void> {
  try {
    // Start server
    await startServer();

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down gracefully');
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
