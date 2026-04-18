import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './redis';

export interface RateLimitConfig {
  limit?: number; // Max requests per window
  window?: number; // Window in seconds
  identifier?: (req: NextRequest) => string; // Function to get unique identifier
}

/**
 * Rate limiting middleware for API routes
 * Usage in API route:
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await withRateLimit(request, { limit: 10, window: 60 });
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *   // Continue with normal logic...
 * }
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): Promise<{ success: boolean; response?: NextResponse }> {
  const {
    limit = 100, // Default 100 requests
    window = 60, // Default 60 seconds (1 minute)
    identifier = (req) => {
      // Default: use IP address or session cookie
      const ip = req.headers.get('x-forwarded-for') ||
                 req.headers.get('x-real-ip') ||
                 'anonymous';
      const session = req.cookies.get('session')?.value;
      return session || ip;
    },
  } = config;

  const id = identifier(request);
  const result = await rateLimit(id, limit, window);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return { success: true };
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function withRateLimitHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: RateLimitConfig = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitResult = await withRateLimit(request, config);

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    return handler(request, ...args);
  };
}
