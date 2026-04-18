import { useState, useEffect } from 'react';
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

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from storage on mount
    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const loadUserFromStorage = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem(TOKEN_KEY),
                AsyncStorage.getItem(USER_KEY),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Verify token is still valid
                const response = await authService.getMe(storedToken);
                if (!response.success || !response.user) {
                    // Token is invalid, clear storage
                    await clearAuth();
                } else {
                    setUser(response.user);
                }
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            await clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const saveAuth = async (newToken: string, newUser: User) => {
        try {
            await Promise.all([
                AsyncStorage.setItem(TOKEN_KEY, newToken),
                AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
            ]);
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Error saving auth:', error);
        }
    };

    const clearAuth = async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem(TOKEN_KEY),
                AsyncStorage.removeItem(USER_KEY),
            ]);
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error clearing auth:', error);
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

    return {
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
}
