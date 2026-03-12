import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/lib/auth-service';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const SELECTED_TEAM_KEY_PREFIX = 'selected_team_id';

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
    selectedTeamId: number | null;
    isLoading: boolean;
    login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (data: { email: string; username: string; password: string; fullName?: string }) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>;
    loginWithMicrosoft: (accessToken: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    setSelectedTeamId: (teamId: number | null) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [selectedTeamId, setSelectedTeamIdState] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from storage on mount
    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const getSelectedTeamStorageKey = (userId: string) => `${SELECTED_TEAM_KEY_PREFIX}:${userId}`;

    const loadSelectedTeamFromStorage = async (userId: string) => {
        try {
            const storedTeamId = await AsyncStorage.getItem(getSelectedTeamStorageKey(userId));
            setSelectedTeamIdState(storedTeamId ? Number(storedTeamId) : null);
        } catch (error) {
            console.error('[AuthContext] Error loading selected team:', error);
            setSelectedTeamIdState(null);
        }
    };

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
                    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
                    await loadSelectedTeamFromStorage(response.user.id);
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
            setSelectedTeamIdState(null);
            console.log('[AuthContext] Auth saved successfully');
        } catch (error) {
            console.error('[AuthContext] Error saving auth:', error);
        }
    };

    const clearAuth = async () => {
        try {
            console.log('[AuthContext] Clearing auth');
            const keysToRemove = [
                AsyncStorage.removeItem(TOKEN_KEY),
                AsyncStorage.removeItem(USER_KEY),
            ];

            if (user?.id) {
                keysToRemove.push(AsyncStorage.removeItem(getSelectedTeamStorageKey(user.id)));
            }

            await Promise.all(keysToRemove);
            setToken(null);
            setUser(null);
            setSelectedTeamIdState(null);
        } catch (error) {
            console.error('[AuthContext] Error clearing auth:', error);
        }
    };

    const setSelectedTeamId = async (teamId: number | null) => {
        if (!user?.id) {
            setSelectedTeamIdState(teamId);
            return;
        }

        try {
            const storageKey = getSelectedTeamStorageKey(user.id);
            if (teamId === null) {
                await AsyncStorage.removeItem(storageKey);
            } else {
                await AsyncStorage.setItem(storageKey, String(teamId));
            }
            setSelectedTeamIdState(teamId);
        } catch (error) {
            console.error('[AuthContext] Error saving selected team:', error);
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
        selectedTeamId,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithMicrosoft,
        logout,
        setSelectedTeamId,
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
