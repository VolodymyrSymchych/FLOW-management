import { Request, Response, NextFunction } from 'express';
import { logger } from '@project-scope-analyzer/shared';

export function serviceAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const serviceApiKey = process.env.SERVICE_API_KEY;
  const providedApiKey = req.headers['x-service-api-key'] as string;

  if (!serviceApiKey) {
    logger.warn('SERVICE_API_KEY is not set - allowing all requests (development mode)');
    return next();
  }

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

  logger.debug('Service authentication successful', {
    path: req.path,
  });
  next();
}
