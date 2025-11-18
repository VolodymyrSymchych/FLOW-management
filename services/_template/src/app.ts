import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@project-scope-analyzer/shared';
import { requestLogger } from './middleware/logger';
import { metricsMiddleware } from './middleware/metrics';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';
import { config } from './config';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging and metrics
  app.use(requestLogger);
  app.use(metricsMiddleware);

  // Routes
  app.use(routes);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}

export async function startServer(): Promise<void> {
  const app = createApp();
  const port = config.service.port;

  app.listen(port, () => {
    logger.info('Server started', {
      port,
      service: config.service.name,
      env: config.service.env,
    });
  });
}

