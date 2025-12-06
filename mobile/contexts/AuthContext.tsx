import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/lib/auth-service';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
    id: string;
    email: string;
    username: string;
    fullName?: string;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (data: { email: string; username: string; password: string; fullName?: string }) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>;
    loginWithMicrosoft: (accessToken: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from storage on mount
    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const loadUserFromStorage = async () => {
        try {
            console.log('[AuthContext] Loading user from storage...');
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem(TOKEN_KEY),
                AsyncStorage.getItem(USER_KEY),
            ]);

            if (storedToken && storedUser) {
                console.log('[AuthContext] Found stored credentials, verifying...');
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Verify token is still valid
                const response = await authService.getMe(storedToken);
                if (!response.success || !response.user) {
                    console.log('[AuthContext] Token invalid, clearing auth');
                    // Token is invalid, clear storage
                    await clearAuth();
                } else {
                    console.log('[AuthContext] Token valid, user authenticated');
                    setUser(response.user);
                }
            } else {
                console.log('[AuthContext] No stored credentials found');
            }
        } catch (error) {
            console.error('[AuthContext] Error loading user from storage:', error);
            await clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const saveAuth = async (newToken: string, newUser: User) => {
        try {
            console.log('[AuthContext] Saving auth for user:', newUser.email);
            await Promise.all([
                AsyncStorage.setItem(TOKEN_KEY, newToken),
                AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
            ]);
            setToken(newToken);
            setUser(newUser);
            console.log('[AuthContext] Auth saved successfully');
        } catch (error) {
            console.error('[AuthContext] Error saving auth:', error);
        }
    };

    const clearAuth = async () => {
        try {
            console.log('[AuthContext] Clearing auth');
            await Promise.all([
                AsyncStorage.removeItem(TOKEN_KEY),
                AsyncStorage.removeItem(USER_KEY),
            ]);
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('[AuthContext] Error clearing auth:', error);
        }
    };

    const login = async (emailOrUsername: string, password: string) => {
        const response = await authService.login({ emailOrUsername, password });

        if (response.success && response.token && response.user) {
            await saveAuth(response.token, response.user);
            return { success: true };
        }

        return { success: false, error: response.error || 'Login failed' };
    };

    const signup = async (data: {
        email: string;
        username: string;
        password: string;
        fullName?: string;
    }) => {
        const response = await authService.signup(data);

        if (response.success && response.token && response.user) {
            await saveAuth(response.token, response.user);
            return { success: true };
        }

        return { success: false, error: response.error || 'Signup failed' };
    };

    const loginWithGoogle = async (idToken: string) => {
        const response = await authService.loginWithGoogle(idToken);
        if (response.success && response.token && response.user) {
            await saveAuth(response.token, response.user);
            return { success: true };
        }
        return { success: false, error: response.error || 'Google login failed' };
    };

    const loginWithMicrosoft = async (accessToken: string) => {
        const response = await authService.loginWithMicrosoft(accessToken);
        if (response.success && response.token && response.user) {
            await saveAuth(response.token, response.user);
            return { success: true };
        }
        return { success: false, error: response.error || 'Microsoft login failed' };
    };

    const logout = async () => {
        if (token) {
            await authService.logout(token);
        }
        await clearAuth();
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithMicrosoft,
        logout,
        isAuthenticated: !!user && !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
