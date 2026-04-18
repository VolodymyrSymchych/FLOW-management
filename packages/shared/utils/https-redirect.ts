import { Request, Response, NextFunction } from 'express';

/**
 * HTTPS Redirect Middleware
 *
 * Redirects HTTP requests to HTTPS in production environments.
 * This middleware should be placed early in the middleware chain.
 *
 * Security benefits:
 * - Prevents man-in-the-middle attacks
 * - Ensures encrypted communication
 * - Works with load balancers (checks x-forwarded-proto header)
 *
 * @example
 * ```typescript
 * import { httpsRedirect } from '@project-scope-analyzer/shared';
 *
 * app.use(httpsRedirect);
 * ```
 */
export function httpsRedirect(req: Request, res: Response, next: NextFunction): void {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if the request is already HTTPS
  // x-forwarded-proto is set by load balancers (Vercel, AWS ELB, etc.)
  const protocol = req.header('x-forwarded-proto') || req.protocol;

  if (protocol !== 'https') {
    const host = req.header('host');
    const redirectUrl = `https://${host}${req.url}`;

    res.redirect(301, redirectUrl); // 301 = Permanent redirect
    return;
  }

  next();
}

/**
 * Strict Transport Security (HSTS) configuration for Helmet
 *
 * This should be used with helmet middleware to set HSTS headers.
 *
 * @example
 * ```typescript
 * import helmet from 'helmet';
 * import { hstsConfig } from '@project-scope-analyzer/shared';
 *
 * app.use(helmet({
 *   hsts: hstsConfig
 * }));
 * ```
 */
export const hstsConfig = {
  maxAge: 31536000, // 1 year in seconds
  includeSubDomains: true,
  preload: true,
};
