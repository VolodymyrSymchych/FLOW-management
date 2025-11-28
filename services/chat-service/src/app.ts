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
      message: 'Chat Service is operational',
      realtime: 'Pusher enabled',
    });
  });

  // Service info endpoint
  app.get('/api', (req, res) => {
    res.json({
      service: config.service.name,
      version: '1.0.0',
      status: 'running',
      realtime: 'Pusher',
      endpoints: {
        health: '/health',
        metrics: '/metrics',
        pusher: {
          auth: 'POST /api/pusher/auth',
        },
        chats: {
          getUserChats: 'GET /api/chats/my',
          getProjectChats: 'GET /api/chats/project/:projectId',
          getTeamChats: 'GET /api/chats/team/:teamId',
          findOrCreateDirect: 'POST /api/chats/direct',
          create: 'POST /api/chats',
          get: 'GET /api/chats/:id',
          update: 'PUT /api/chats/:id',
          delete: 'DELETE /api/chats/:id',
          getMembers: 'GET /api/chats/:id/members',
          addMember: 'POST /api/chats/:id/members',
          removeMember: 'DELETE /api/chats/:id/members/:userId',
        },
        messages: {
          send: 'POST /api/messages',
          getChatMessages: 'GET /api/messages/chat/:chatId',
          getUnreadCount: 'GET /api/messages/chat/:chatId/unread',
          markChatAsRead: 'PUT /api/messages/chat/:chatId/read',
          get: 'GET /api/messages/:id',
          edit: 'PUT /api/messages/:id',
          delete: 'DELETE /api/messages/:id',
          markAsRead: 'PUT /api/messages/:id/read',
          getReactions: 'GET /api/messages/:id/reactions',
          addReaction: 'POST /api/messages/:id/reactions',
          removeReaction: 'DELETE /api/messages/:id/reactions/:emoji',
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
      realtime: 'Pusher',
    });
  });
}
