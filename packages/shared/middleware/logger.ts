import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    req.startTime = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - req.startTime!) / 1000;
        logger.info('HTTP request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
}

declare global {
    namespace Express {
        interface Request {
            startTime?: number;
        }
    }
}
