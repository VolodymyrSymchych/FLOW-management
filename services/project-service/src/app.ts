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

  // Simple health check without database (for Vercel health checks)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: config.service.name,
      env: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      service: config.service.name,
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Service info endpoint (not on root to avoid conflicts with frontend)
  app.get('/api', (req, res) => {
    res.json({
      service: config.service.name,
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/health',
        ready: '/api/ready',
        metrics: '/api/metrics',
        projects: {
          getProjects: 'GET /api/projects',
          getProject: 'GET /api/projects/:id',
          createProject: 'POST /api/projects',
          updateProject: 'PUT /api/projects/:id',
          deleteProject: 'DELETE /api/projects/:id',
          getStats: 'GET /api/projects/stats',
          getTemplates: 'GET /api/projects/templates',
          getTemplate: 'GET /api/projects/templates/:id',
          createFromTemplate: 'POST /api/projects/from-template',
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

