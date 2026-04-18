'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Token is missing.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to verify email');
                }

                setStatus('success');
                setMessage('Email verified successfully! You can now log in.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/sign-in');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Failed to verify email. The link may be expired or invalid.');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            {/* Background effects */}
            <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="fixed top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-strong rounded-2xl p-8 border border-border text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Verifying Email</h2>
                            <p className="text-text-secondary">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Success!</h2>
                            <p className="text-text-secondary mb-6">{message}</p>
                            <p className="text-sm text-text-tertiary">Redirecting to login...</p>
                            <Link
                                href="/sign-in"
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
                                <XCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Verification Failed</h2>
                            <p className="text-text-secondary mb-6">{message}</p>
                            <Link
                                href="/sign-in"
                                className="px-6 py-2 glass-subtle border border-border rounded-lg hover:bg-surface-elevated transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
