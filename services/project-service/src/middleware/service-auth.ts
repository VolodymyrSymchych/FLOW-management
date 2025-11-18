import { Request, Response, NextFunction } from 'express';
import { logger } from '@project-scope-analyzer/shared';

/**
 * Middleware for service-to-service authentication
 * Protects microservices from unauthorized access
 * 
 * Usage: Add this middleware to routes that should only be accessible
 * from other services (not from public internet)
 */
export function serviceAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const serviceApiKey = process.env.SERVICE_API_KEY;
  const providedApiKey = req.headers['x-service-api-key'] as string;

  // If SERVICE_API_KEY is not set, allow all requests (for development)
  if (!serviceApiKey) {
    logger.warn('SERVICE_API_KEY is not set - allowing all requests (development mode)');
    return next();
  }

  // Check if API key is provided
  if (!providedApiKey) {
    logger.warn('Service authentication failed: No API key provided', {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Service API key is required',
    });
    return;
  }

  // Verify API key
  if (providedApiKey !== serviceApiKey) {
    logger.warn('Service authentication failed: Invalid API key', {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid service API key',
    });
    return;
  }

  // API key is valid
  logger.debug('Service authentication successful', {
    path: req.path,
  });
  next();
}

/**
 * Optional service authentication middleware
 * Doesn't fail if no API key is provided, but logs it
 */
export function optionalServiceAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const serviceApiKey = process.env.SERVICE_API_KEY;
  const providedApiKey = req.headers['x-service-api-key'] as string;

  if (serviceApiKey && providedApiKey) {
    if (providedApiKey !== serviceApiKey) {
      logger.warn('Optional service authentication failed: Invalid API key', {
        ip: req.ip,
        path: req.path,
      });
    } else {
      logger.debug('Optional service authentication successful', {
        path: req.path,
      });
    }
  }

  next();
}

