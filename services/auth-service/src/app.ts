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

  // Health check without /api prefix (for convenience)
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: config.service.name,
    });
  });

  // Service info endpoint (not on root to avoid conflicts with frontend)
  app.get('/api', (req: express.Request, res: express.Response) => {
    res.json({
      service: config.service.name,
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/health',
        ready: '/api/ready',
        metrics: '/api/metrics',
        auth: {
          signup: 'POST /api/auth/signup',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          verifyEmail: 'POST /api/auth/verify-email',
          me: 'GET /api/auth/me',
        },
      },
    });
  });

  // Routes
  app.use('/api', routes);

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

