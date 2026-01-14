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
    maxAge: 86400,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging and metrics
  app.use(requestLogger);
  app.use(metricsMiddleware);

  // Root path handler - redirect to service info
  app.get('/', (req, res) => {
    res.redirect('/api');
  });

  // Health check without /api prefix (for convenience)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: config.service.name,
    });
  });

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
        users: {
          me: 'GET /api/users/me',
          getUser: 'GET /api/users/:id',
          search: 'GET /api/users/search?q=query',
          updateProfile: 'PUT /api/users/:id/profile',
        },
        friends: {
          getFriends: 'GET /api/friends',
          sendRequest: 'POST /api/friends/requests',
          acceptRequest: 'POST /api/friends/requests/:id/accept',
          rejectRequest: 'POST /api/friends/requests/:id/reject',
          removeFriendship: 'DELETE /api/friends/:id',
        },
      },
    });
  });

  // Routes
  app.use('/api', routes);

  // 404 handler for unmatched routes (must be before error handler)
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
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

