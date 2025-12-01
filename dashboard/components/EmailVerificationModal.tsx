'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailVerificationModalProps {
    email: string;
    onResend?: () => Promise<void>;
}

export function EmailVerificationModal({ email, onResend }: EmailVerificationModalProps) {
    const router = useRouter();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (countdown > 0 && resent) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, resent]);

    const handleResend = async () => {
        if (resending || countdown > 0) return;

        setResending(true);
        try {
            if (onResend) {
                await onResend();
            }
            setResent(true);
            setCountdown(60);
        } catch (error) {
            console.error('Failed to resend email:', error);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-8">
            {/* Background effects */}
            <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="fixed top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-1/4 -right-48 w-[700px] h-[700px] bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-strong rounded-2xl p-8 border border-border text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <Mail className="w-10 h-10 text-primary" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold gradient-text mb-3">
                        Перевірте вашу пошту
                    </h2>

                    {/* Description */}
                    <p className="text-text-secondary mb-6">
                        Ми відправили лист з підтвердженням на адресу:
                    </p>

                    {/* Email */}
                    <div className="glass-subtle rounded-lg p-4 mb-6 border border-border">
                        <p className="text-text-primary font-semibold break-all">{email}</p>
                    </div>

                    {/* Instructions */}
                    <div className="text-left space-y-3 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">1</span>
                            </div>
                            <p className="text-sm text-text-secondary">
                                Відкрийте вашу поштову скриньку
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">2</span>
                            </div>
                            <p className="text-sm text-text-secondary">
                                Знайдіть лист від Flow Management
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">3</span>
                            </div>
                            <p className="text-sm text-text-secondary">
                                Натисніть на кнопку "Підтвердити Email"
                            </p>
                        </div>
                    </div>

                    {/* Resend section */}
                    <div className="mb-4">
                        <p className="text-sm text-text-secondary mb-3">
                            Нічого не прийшло?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={resending || countdown > 0}
                            className="w-full glass-subtle hover:glass-light border border-border rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <RefreshCw className={`w-5 h-5 ${resending ? 'animate-spin' : ''}`} />
                            <span>
                                {resending
                                    ? 'Відправляємо...'
                                    : countdown > 0
                                        ? `Надіслати знову (${countdown}с)`
                                        : 'Надіслати знову'}
                            </span>
                        </button>
                    </div>

                    {resent && (
                        <p className="text-sm text-success mb-4">
                            ✓ Лист успішно відправлено!
                        </p>
                    )}

                    {/* Back to sign in */}
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        Повернутися до входу
                    </button>
                </div>

                {/* Help text */}
                <p className="text-center text-sm text-text-tertiary mt-6">
                    Не отримали лист? Перевірте папку "Спам" або "Промоакції"
                </p>
            </div>
        </div>
    );
}
