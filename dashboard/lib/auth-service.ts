/**
 * Auth Service API client
 * Proxies requests to the auth-service microservice
 */

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3002';

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
  } else if (typeof window === 'undefined') {
    // Log warning if API key is missing in server-side context
    console.warn('AUTH_SERVICE_API_KEY is not set - requests may fail if auth-service requires it');
  }

  // Log the request URL in development (without sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth service request:', {
      url,
      method: options.method || 'GET',
      hasApiKey: !!serviceApiKey,
    });
  }

  console.log(`[AuthService] Proxying request to: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`[AuthService] Response from ${url}: ${response.status} ${response.statusText}`);

  return response;
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
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        console.error('Auth service signup error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        return {
          success: false,
          error: errorData.error || errorData.message || `Signup failed: ${response.status}`,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service signup network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
      };
    }
  },

  async login(data: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthServiceResponse> {
    try {
      const response = await proxyToAuthService('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        console.error('Auth service login error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: `${AUTH_SERVICE_URL}/api/auth/login`,
        });

        return {
          success: false,
          error: errorData.error || errorData.message || `Login failed: ${response.status}`,
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
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        return {
          success: false,
          error: errorData.error || errorData.message || `Logout failed: ${response.status}`,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service logout network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
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
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        return {
          success: false,
          error: errorData.error || errorData.message || `Failed to get user: ${response.status}`,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service getMe network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
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
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        return {
          success: false,
          error: errorData.error || errorData.message || `Email verification failed: ${response.status}`,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service verifyEmail network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
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
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }

        return {
          success: false,
          error: errorData.error || errorData.message || `Resend verification failed: ${response.status}`,
        };
      }

      return response.json();
    } catch (error: any) {
      console.error('Auth service resendVerificationEmail network error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to auth service',
      };
    }
  },
};
