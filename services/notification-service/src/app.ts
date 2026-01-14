import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger, httpsRedirect, hstsConfig, requestLogger, metricsMiddleware, errorHandler } from '@project-scope-analyzer/shared';
import routes from './routes';
import { config } from './config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

export function createApp(): Express {
  const app = express();

  // HTTPS redirect (must be first)
  app.use(httpsRedirect);

  // Security middleware with enhanced HSTS
  app.use(helmet({
    hsts: hstsConfig,
  }));
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-service-api-key'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging and metrics
  app.use(requestLogger);
  app.use(metricsMiddleware);

  // Root endpoint - service info
  app.get('/', (req, res) => {
    res.json({
      service: config.service.name,
      version: '1.0.0',
      status: 'running',
      message: 'Notification Service is operational',
    });
  });

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Service info endpoint
  app.get('/api', (req, res) => {
    res.json({
      service: config.service.name,
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        metrics: '/metrics',
        notifications: {
          getNotifications: 'GET /api/notifications',
          getUnread: 'GET /api/notifications/unread',
          getUnreadCount: 'GET /api/notifications/unread/count',
          getNotification: 'GET /api/notifications/:id',
          createNotification: 'POST /api/notifications',
          markAsRead: 'PUT /api/notifications/:id/read',
          markAllAsRead: 'PUT /api/notifications/mark-all-read',
          deleteNotification: 'DELETE /api/notifications/:id',
          deleteReadNotifications: 'DELETE /api/notifications/read',
        },
        preferences: {
          getPreferences: 'GET /api/preferences',
          updatePreferences: 'PUT /api/preferences',
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
  app.use((req, res) => {
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
