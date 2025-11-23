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
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: config.service.name,
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
        tasks: {
          getTasks: 'GET /api/tasks',
          getTask: 'GET /api/tasks/:id',
          createTask: 'POST /api/tasks',
          updateTask: 'PUT /api/tasks/:id',
          deleteTask: 'DELETE /api/tasks/:id',
          getSubtasks: 'GET /api/tasks/:id/subtasks',
          createSubtask: 'POST /api/tasks/:id/subtasks',
          getDependencies: 'GET /api/tasks/:id/dependencies',
          getGanttData: 'GET /api/tasks/gantt',
        },
      },
    });
  });

  // Routes
  app.use('/api', routes);

  // Catch-all for common browser requests (favicon, etc.)
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // 404 handler for all other routes
  app.use((req, res, next) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      service: config.service.name,
    });
  });

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

