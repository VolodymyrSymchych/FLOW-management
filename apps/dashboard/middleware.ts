import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import createMiddleware from 'next-intl/middleware';

// Validate JWT_SECRET is set (only at runtime, not during build)
const getJWTSecret = () => {
  if (!process.env.JWT_SECRET) {
    // Return a placeholder for build time - validation happens at runtime
    return 'build-time-placeholder-secret-min-32-chars-long';
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn('JWT_SECRET should be at least 32 characters long');
  }

  return process.env.JWT_SECRET;
};

const JWT_SECRET = new TextEncoder().encode(getJWTSecret());
const INTERNAL_TOOLS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.INTERNAL_TOOLS === 'true';

// Circuit breaker: skip Redis for 30s after a failure to avoid blocking every request
let redisCircuitOpen = false;
let redisCircuitResetAt = 0;

function isRedisAvailable(): boolean {
  if (!redisCircuitOpen) return true;
  if (Date.now() >= redisCircuitResetAt) {
    redisCircuitOpen = false;
    return true;
  }
  return false;
}

function tripRedisCircuit(): void {
  redisCircuitOpen = true;
  redisCircuitResetAt = Date.now() + 30_000;
}

// Simple Redis cache for Edge Runtime (using fetch API)
async function getCachedSession(token: string): Promise<string | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!isRedisAvailable()) return null;

  try {
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/session:${token}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.result;
  } catch (error) {
    tripRedisCircuit();
    return null;
  }
}

async function cacheSession(token: string, userId: string, ttl: number = 3600): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return;
  }
  if (!isRedisAvailable()) return;

  try {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/session:${token}/${userId}/ex/${ttl}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    tripRedisCircuit();
  }
}

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/tasks',
  '/team',
  '/settings',
  '/documentation',
  '/attendance',
  '/billing',
  '/messages',
  '/friends',
  '/timeline',
  '/projects-timeline',
  '/payment',
  '/charts',
  '/invoices',
  ...(INTERNAL_TOOLS_ENABLED ? ['/performance'] : []),
];

// Public routes that authenticated users shouldn't access
const authRoutes = ['/sign-in', '/sign-up'];

// Create a function that determines locale from cookie or URL
function getLocale(request: NextRequest): string {
  // First, check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && ['en', 'uk'].includes(cookieLocale)) {
    return cookieLocale;
  }

  // Fall back to URL
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/(en|uk)(\/|$)/);
  if (localeMatch) {
    return localeMatch[1];
  }

  // Default to English
  return 'en';
}

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'uk'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Determine locale from cookie first, then URL
  localePrefix: 'always',

  // Use custom locale detection
  localeDetection: false
});

export async function middleware(request: NextRequest) {
  try {
    // 1. Check for locale cookie and redirect if needed
    const localeFromCookie = request.cookies.get('NEXT_LOCALE')?.value;
    const { pathname } = request.nextUrl;

    // If we have a locale cookie and the URL doesn't match it, redirect to the correct locale
    if (localeFromCookie && ['en', 'uk'].includes(localeFromCookie)) {
      const currentLocaleMatch = pathname.match(/^\/(en|uk)(\/|$)/);
      const currentLocale = currentLocaleMatch ? currentLocaleMatch[1] : null;

      if (currentLocale && currentLocale !== localeFromCookie) {
        // URL has a different locale than cookie - redirect to cookie locale
        const newPathname = pathname.replace(/^\/(en|uk)/, `/${localeFromCookie}`);
        return NextResponse.redirect(new URL(newPathname, request.url));
      }
    }

    // 2. Run next-intl middleware to handle locale prefixes
    const response = intlMiddleware(request);

    // 3. Check authentication

    // Remove locale prefix to check routes
    const pathnameWithoutLocale = pathname.replace(/^\/(en|uk)/, '');

    // Check if the route needs protection
    const isProtectedRoute = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathnameWithoutLocale.startsWith(route));

    // Skip auth check for non-protected and non-auth routes
    if (!isProtectedRoute && !isAuthRoute) {
      return response;
    }

    // Get the session token
    const token = request.cookies.get('session')?.value;

    // Verify authentication
    let isAuthenticated = false;
    let userId: string | null = null;

    if (token) {
      try {
        // Try to get from cache first
        const cachedUserId = await getCachedSession(token);

        if (cachedUserId) {
          // Cache hit - skip JWT verification
          isAuthenticated = true;
          userId = cachedUserId;
        } else {
          // Cache miss - verify JWT
          const { payload } = await jwtVerify(token, JWT_SECRET);
          isAuthenticated = true;
          userId = payload.userId as string;

          // Cache the session for future requests (fire-and-forget, don't block response)
          void cacheSession(token, userId, 3600);
        }
      } catch (error) {
        // Token is invalid or expired
        isAuthenticated = false;
      }
    }

    // Redirect logic
    if (isProtectedRoute && !isAuthenticated) {
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    // Log error but don't crash the middleware
    console.error('Middleware error:', error);

    // Security: On middleware error, redirect to sign-in for protected routes
    // This prevents bypassing authentication if an error occurs
    const { pathname } = request.nextUrl;
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // For non-protected routes, allow continuation
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png (favicon files)
     * - static files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.png|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)',
  ],
};
