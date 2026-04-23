/**
 * Auth Service API client
 * Proxies requests to the auth-service microservice
 */

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
  'http://localhost:3002';

// Log configuration in server-side context (development only)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Auth Service Configuration:', {
    url: AUTH_SERVICE_URL,
    hasApiKey: !!process.env.AUTH_SERVICE_API_KEY,
  });
}

export interface AuthServiceResponse<T = any> {
  success?: boolean;
  user?: T;
  token?: string;
  error?: string;
  message?: string;
  status?: number;
}

export async function proxyToAuthService(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${AUTH_SERVICE_URL}${endpoint}`;

  // Get service API key from server-side environment (not exposed to client)
  const serviceApiKey = typeof window === 'undefined'
    ? process.env.AUTH_SERVICE_API_KEY
    : undefined;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Add service-to-service authentication header (server-side only)
  if (serviceApiKey) {
    headers.set('X-Service-API-Key', serviceApiKey);
  }

  const controller = new AbortController();
  const timeoutMs = process.env.NODE_ENV === 'production' ? 10_000 : 30_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authService = {
  async signup(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    name?: string; // Keep for backward compatibility
  }): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        console.error('Auth service signup error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service signup network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async login(data: {
    emailOrUsername: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        console.error('Auth service login error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: `${AUTH_SERVICE_URL}/api/auth/login`,
        });

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service login network error:', {
        error: error.message,
        url: `${AUTH_SERVICE_URL}/api/auth/login`,
      });

      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async logout(token: string): Promise<AuthServiceResponse> {
    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      // Add service API key if available (server-side only)
      if (typeof window === 'undefined') {
        const serviceApiKey = process.env.AUTH_SERVICE_API_KEY;
        if (serviceApiKey) {
          headers['X-Service-API-Key'] = serviceApiKey;
        }
      }

      const response = await proxyToAuthService('/api/auth/logout', {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service logout network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async getMe(token: string): Promise<AuthServiceResponse> {
    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      // Add service API key if available (server-side only)
      if (typeof window === 'undefined') {
        const serviceApiKey = process.env.AUTH_SERVICE_API_KEY;
        if (serviceApiKey) {
          headers['X-Service-API-Key'] = serviceApiKey;
        }
      }

      const response = await proxyToAuthService('/api/auth/me', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service getMe network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async verifyEmail(data: { token: string }): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service verifyEmail network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async resendVerificationEmail(email: string): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service resendVerificationEmail network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async forgotPassword(email: string): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service forgotPassword network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },

  async resetPassword(token: string, password: string): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);

        return {
          success: false,
          error: extractErrorMessage(errorData, response.status),
          status: response.status,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service resetPassword network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
        status: 502,
      };
    }
  },
};

async function parseErrorResponse(response: Response): Promise<any> {
  const errorText = await response.text();

  try {
    return JSON.parse(errorText);
  } catch {
    return { error: errorText || `HTTP ${response.status}` };
  }
}

function extractErrorMessage(errorData: any, status: number): string {
  if (typeof errorData === 'string') return errorData;

  if (errorData?.error) {
    if (typeof errorData.error === 'string') return errorData.error;
    if (typeof errorData.error === 'object') {
      const errObj = errorData.error;

      // Handle validation errors
      if (errObj.code === 'VALIDATION_ERROR' && errObj.details?.errors && Array.isArray(errObj.details.errors)) {
        const firstError = errObj.details.errors[0];
        if (firstError?.message) {
          return firstError.message; // Return the first validation error message
        }
      }

      if (errObj.message) return errObj.message;
    }
  }

  return errorData?.message || `Request failed: ${status}`;
}
