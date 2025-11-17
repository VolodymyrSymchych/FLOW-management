/**
 * Secure error handling utilities
 * Prevents information leakage through error messages
 */

import { NextResponse } from 'next/server';

/**
 * Error types that should show specific messages to users
 */
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  // Database errors
  'unique constraint': 'This record already exists',
  'foreign key constraint': 'Cannot delete this record because it is referenced by other records',
  'not found': 'The requested resource was not found',

  // Validation errors
  'validation failed': 'Validation error',
  'invalid input': 'Invalid input provided',

  // Auth errors
  'unauthorized': 'Authentication required',
  'forbidden': 'You do not have permission to access this resource',
  'invalid credentials': 'Invalid email or password',

  // File errors
  'file too large': 'File size exceeds the maximum allowed',
  'invalid file type': 'File type is not supported',
};

/**
 * Sanitizes error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: any): string {
  // If error is a string, check against safe messages
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  const lowerMessage = errorMessage.toLowerCase();

  // Check if error message matches any safe patterns
  for (const [pattern, safeMessage] of Object.entries(SAFE_ERROR_MESSAGES)) {
    if (lowerMessage.includes(pattern)) {
      return safeMessage;
    }
  }

  // Default generic error message
  return 'An error occurred while processing your request';
}

/**
 * Creates a secure error response that doesn't leak sensitive information
 */
export function createErrorResponse(
  error: any,
  defaultMessage: string = 'An error occurred',
  status: number = 500
): NextResponse {
  // Log the full error for debugging (server-side only)
  console.error('Error:', {
    message: error?.message,
    name: error?.name,
    // Don't log stack traces in production
    ...(process.env.NODE_ENV === 'development' && { stack: error?.stack }),
  });

  // Return sanitized error to client
  const sanitizedMessage = sanitizeErrorMessage(error) || defaultMessage;

  return NextResponse.json(
    { error: sanitizedMessage },
    { status }
  );
}

/**
 * Common error response creators
 */
export const ErrorResponses = {
  unauthorized: () => NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  ),

  forbidden: () => NextResponse.json(
    { error: 'You do not have permission to access this resource' },
    { status: 403 }
  ),

  notFound: (resource: string = 'Resource') => NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  ),

  badRequest: (message: string = 'Invalid request') => NextResponse.json(
    { error: message },
    { status: 400 }
  ),

  conflict: (message: string = 'Resource already exists') => NextResponse.json(
    { error: message },
    { status: 409 }
  ),

  tooManyRequests: (retryAfter?: number) => {
    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter.toString();
    }
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  },

  internalError: (error?: any) => createErrorResponse(
    error,
    'An internal error occurred',
    500
  ),
};

/**
 * Wraps an async route handler with error handling
 */
export function withErrorHandler<T>(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return ErrorResponses.internalError(error);
    }
  };
}
