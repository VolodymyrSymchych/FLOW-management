import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            console.log('[AuthGuard] Loading...');
            return;
        }

        if (!segments || segments.length === 0) {
            console.log('[AuthGuard] No segments yet');
            return;
        }

        const inAuthGroup = String(segments[0]) === '(auth)';
        console.log('[AuthGuard] Auth check:', { isAuthenticated, inAuthGroup, segments: segments.join('/') });

        if (!isAuthenticated && !inAuthGroup) {
            console.log('[AuthGuard] Not authenticated, redirecting to login');
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            console.log('[AuthGuard] Authenticated in auth group, redirecting to projects');
            router.replace('/(tabs)/projects');
        }
    }, [isAuthenticated, segments, isLoading]);

    return <>{children}</>;
}

function RootLayoutContent() {
    return (
        <AuthGuard>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </AuthGuard>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RootLayoutContent />
                </AuthProvider>
                <StatusBar style="light" />
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
