import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger, httpsRedirect, hstsConfig, requestLogger, metricsMiddleware, errorHandler } from '@project-scope-analyzer/shared';
import routes from './routes';
import { config } from './config';

export function createApp(): Express {
  const app = express();

  // HTTPS redirect (must be first)
  app.use(httpsRedirect);

  // Security middleware with enhanced HSTS
  app.use(helmet({
    hsts: hstsConfig,
  }));
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin is in the allowed list
      if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  }));

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
        teams: {
          getTeams: 'GET /api/teams',
          getTeam: 'GET /api/teams/:id',
          createTeam: 'POST /api/teams',
          updateTeam: 'PUT /api/teams/:id',
          deleteTeam: 'DELETE /api/teams/:id',
          getMembers: 'GET /api/teams/:id/members',
          addMember: 'POST /api/teams/:id/members',
          removeMember: 'DELETE /api/teams/:id/members/:userId',
          updateMemberRole: 'PUT /api/teams/:id/members/:userId/role',
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
