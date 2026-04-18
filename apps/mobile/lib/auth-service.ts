/**
 * Auth Service API Client for Mobile
 * Adapted from dashboard/lib/auth-service.ts
 */

import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment or use default
const AUTH_SERVICE_URL = process.env.EXPO_PUBLIC_AUTH_SERVICE_URL || 'https://flow-auth-service.vercel.app';

console.log('Auth Service URL:', AUTH_SERVICE_URL);

export interface AuthServiceResponse<T = any> {
    success?: boolean;
    user?: T;
    token?: string;
    error?: string;
    message?: string;
}

const api = axios.create({
    baseURL: AUTH_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_AUTH_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`[AuthService] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[AuthService] Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log(`[AuthService] Response ${response.status} from ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[AuthService] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

function extractErrorMessage(errorData: any, status?: number): string {
    if (typeof errorData === 'string') return errorData;

    if (errorData?.error) {
        if (typeof errorData.error === 'string') return errorData.error;
        if (typeof errorData.error === 'object') {
            const errObj = errorData.error;

            // Handle validation errors
            if (errObj.code === 'VALIDATION_ERROR' && errObj.details?.errors && Array.isArray(errObj.details.errors)) {
                const firstError = errObj.details.errors[0];
                if (firstError?.message) {
                    return firstError.message;
                }
            }

            if (errObj.message) return errObj.message;
        }
    }

    return errorData?.message || `Request failed${status ? `: ${status}` : ''}`;
}

export const authService = {
    async signup(data: {
        email: string;
        username: string;
        password: string;
        fullName?: string;
    }): Promise<AuthServiceResponse> {
        try {
            console.log('[AuthService] Signup attempt for:', data.email, '/', data.username);
            const response = await api.post('/api/auth/signup', data);
            console.log('[AuthService] Signup successful');
            return response.data;
        } catch (error: any) {
            console.error('[AuthService] Signup failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async login(data: {
        emailOrUsername: string;
        password: string;
    }): Promise<AuthServiceResponse> {
        try {
            console.log('[AuthService] Login attempt for:', data.emailOrUsername);
            const response = await api.post('/api/auth/login', data);
            console.log('[AuthService] Login successful');
            return response.data;
        } catch (error: any) {
            console.error('[AuthService] Login failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });

            // Handle 401 specifically
            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Invalid credentials. Please check your email/username and password.',
                };
            }

            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async loginWithGoogle(idToken: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/google', { token: idToken });
            return response.data;
        } catch (error: any) {
            console.error('Auth service google login error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async loginWithMicrosoft(accessToken: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/microsoft', { token: accessToken });
            return response.data;
        } catch (error: any) {
            console.error('Auth service microsoft login error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async logout(token: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/logout', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Auth service logout error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async getMe(token: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.get('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Auth service getMe error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async verifyEmail(data: { token: string }): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/verify-email', data);
            return response.data;
        } catch (error: any) {
            console.error('Auth service verifyEmail error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async resendVerificationEmail(email: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/resend-verification', { email });
            return response.data;
        } catch (error: any) {
            console.error('Auth service resendVerificationEmail error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async forgotPassword(email: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (error: any) {
            console.error('Auth service forgotPassword error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },

    async resetPassword(token: string, password: string): Promise<AuthServiceResponse> {
        try {
            const response = await api.post('/api/auth/reset-password', { token, password });
            return response.data;
        } catch (error: any) {
            console.error('Auth service resetPassword error:', error);
            return {
                success: false,
                error: error.response?.data
                    ? extractErrorMessage(error.response.data, error.response.status)
                    : error.message || 'Failed to connect to auth service',
            };
        }
    },
};
