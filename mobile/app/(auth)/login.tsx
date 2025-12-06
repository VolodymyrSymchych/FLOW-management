import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import GradientBackground from '../../components/GradientBackground';
import GlassCard from '../../components/GlassCard';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Google Auth Request
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        clientId: '733597100022-pqrp53a7ls3h6vj5q2o0apufv56mtisp.apps.googleusercontent.com',
    });

    // Microsoft Auth Request
    const microsoftDiscovery = {
        authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    };

    const [microsoftRequest, microsoftResponse, microsoftPromptAsync] = useAuthRequest(
        {
            clientId: 'caafd2b0-3f3d-47cf-ad1a-a034eeafdde0',
            scopes: ['openid', 'profile', 'email', 'User.Read'],
            redirectUri: makeRedirectUri({
                scheme: 'project-scope-analyzer'
            }),
            responseType: ResponseType.Token,
        },
        microsoftDiscovery
    );

    useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { authentication } = googleResponse;
            if (authentication?.idToken) {
                handleGoogleLogin(authentication.idToken);
            } else if (authentication?.accessToken) {
                handleGoogleLogin(authentication.accessToken);
            }
        } else if (googleResponse?.type === 'error') {
            // console.error('Google Sign-In Error:', googleResponse.error);
            // Alert.alert('Google Sign-In Error', 'Could not sign in with Google');
        }
    }, [googleResponse]);

    useEffect(() => {
        if (microsoftResponse?.type === 'success') {
            const { authentication } = microsoftResponse;
            if (authentication?.accessToken) {
                handleMicrosoftLoginHelper(authentication.accessToken);
            }
        } else if (microsoftResponse?.type === 'error') {
            Alert.alert('Microsoft Sign-In Error', 'Could not sign in with Microsoft');
        }
    }, [microsoftResponse]);

    const handleGoogleLogin = async (token: string) => {
        setIsLoading(true);
        try {
            const result = await loginWithGoogle(token);
            if (result.success) {
                router.replace('/(tabs)/projects');
            } else {
                Alert.alert('Google Login Failed', result.error || 'Please try again');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during Google sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftLoginHelper = async (token: string) => {
        setIsLoading(true);
        try {
            const result = await loginWithMicrosoft(token);
            if (result.success) {
                router.replace('/(tabs)/projects');
            } else {
                Alert.alert('Microsoft Login Failed', result.error || 'Please try again');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during Microsoft sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!emailOrUsername || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(emailOrUsername, password);

            if (result.success) {
                router.replace('/(tabs)/projects');
            } else {
                Alert.alert('Login Failed', result.error || 'Please check your credentials and try again');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="layers" size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue to Flow</Text>
                    </View>

                    <GlassCard intensity="heavy" style={styles.card}>
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email or Username"
                                    placeholderTextColor={Colors.text.tertiary}
                                    value={emailOrUsername}
                                    onChangeText={setEmailOrUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.text.tertiary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => { /* Navigate to forgot password */ }}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={() => googlePromptAsync()}
                                disabled={!googleRequest || isLoading}
                            >
                                <Ionicons name="logo-google" size={24} color={Colors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={() => microsoftPromptAsync()}
                                disabled={!microsoftRequest || isLoading}
                            >
                                <Ionicons name="logo-microsoft" size={24} color={Colors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color={Colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                <Text style={styles.signUpText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </View>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.glass.medium,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    title: {
        fontSize: Typography.sizes['3xl'],
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.text.secondary,
    },
    card: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
    },
    form: {
        gap: Spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.glass.light,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        color: Colors.text.primary,
        fontSize: Typography.sizes.base,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border.light,
    },
    dividerText: {
        color: Colors.text.tertiary,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.sizes.sm,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.glass.medium,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: Colors.text.secondary,
        fontSize: Typography.sizes.sm,
    },
    signUpText: {
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
    },
});
