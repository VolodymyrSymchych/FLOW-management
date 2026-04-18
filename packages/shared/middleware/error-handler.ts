import { Request, Response, NextFunction } from 'express';
import { AppError, getErrorResponse, isAppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { recordHttpRequest } from '../utils/metrics';

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const start = (req as any).startTime || Date.now();
    const duration = (Date.now() - start) / 1000;

    if (isAppError(error)) {
        recordHttpRequest(req.method, req.route?.path || req.path, error.statusCode, duration);
        logger.warn('Request error', {
            error: error.message,
            code: error.code,
            statusCode: error.statusCode,
            path: req.path,
            method: req.method,
        });

        const response = getErrorResponse(error);
        res.status(error.statusCode).json(response);
        return;
    }

    // Unknown error
    recordHttpRequest(req.method, req.route?.path || req.path, 500, duration);
    logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    const response = getErrorResponse(error);
    res.status(500).json(response);
}
