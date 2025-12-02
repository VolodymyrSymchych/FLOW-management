'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Missing reset token. Please request a new password reset link.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setSuccess(true);
            // Redirect to sign in after 3 seconds
            setTimeout(() => {
                router.push('/sign-in');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
                <div className="glass-strong rounded-2xl p-8 border border-border max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Invalid Link</h1>
                    <p className="text-text-secondary mb-6">
                        This password reset link is invalid or missing. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="glass-button w-full py-3 rounded-xl font-semibold text-white inline-block"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-8 overflow-y-auto">
            {/* Background effects */}
            <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="fixed top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-1/4 -right-48 w-[700px] h-[700px] bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md my-auto">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-10">
                        <Logo variant="default" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Reset Password</h1>
                    <p className="text-text-secondary">Create a new secure password</p>
                </div>

                {/* Form */}
                <div className="glass-strong rounded-2xl p-8 border border-border">
                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-text-primary mb-2">Password Reset Successful</h3>
                                <p className="text-text-secondary">
                                    Your password has been successfully updated. Redirecting to sign in...
                                </p>
                            </div>
                            <Link
                                href="/sign-in"
                                className="glass-button w-full py-3 rounded-xl font-semibold text-white hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="glass-input w-full pl-12 pr-12 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="glass-input w-full pl-12 pr-12 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="glass-button w-full py-3 rounded-xl font-semibold text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            {/* Back to Sign In */}
                            <div className="text-center">
                                <Link
                                    href="/sign-in"
                                    className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="text-text-secondary">Loading...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
