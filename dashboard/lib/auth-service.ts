/**
 * Auth Service API client
 * Proxies requests to the auth-service microservice
 */

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3002';

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
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export const authService = {
  async signup(data: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }): Promise<AuthServiceResponse> {
    const response = await proxyToAuthService('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async login(data: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthServiceResponse> {
    const response = await proxyToAuthService('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async logout(token: string): Promise<AuthServiceResponse> {
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

    return response.json();
  },

  async getMe(token: string): Promise<AuthServiceResponse> {
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

    return response.json();
  },

  async verifyEmail(data: { token: string }): Promise<AuthServiceResponse> {
    const response = await proxyToAuthService('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  },
};

