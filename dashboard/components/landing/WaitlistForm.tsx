'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitlistFormProps {
    className?: string;
    variant?: 'default' | 'compact';
}

export function WaitlistForm({ className = '', variant = 'default' }: WaitlistFormProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            // Call waitlist API
            const apiUrl = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
            const response = await fetch(`${apiUrl}/api/waitlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setEmail('');

                // Track conversion
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'waitlist_signup', {
                        event_category: 'engagement',
                        event_label: email,
                    });
                }
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to join waitlist');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Something went wrong. Please try again.');
            console.error('Waitlist error:', error);
        }
    };

    if (variant === 'compact') {
        return (
            <div className={className}>
                <form onSubmit={handleSubmit} className="flex gap-2 max-w-md" aria-labelledby="waitlist-heading-compact" noValidate>
                    <h2 id="waitlist-heading-compact" className="sr-only">Join the waitlist</h2>
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                        <label htmlFor="waitlist-email-compact" className="sr-only">Email address</label>
                        <input
                            id="waitlist-email-compact"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-foreground/10 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            required
                            aria-required="true"
                            aria-invalid={status === 'error'}
                            aria-describedby={status === 'error' ? 'waitlist-error-compact' : status === 'success' ? 'waitlist-success-compact' : undefined}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-600 text-foreground font-semibold hover:from-orange-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Joining...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Joined!
                            </>
                        ) : (
                            'Join Waitlist'
                        )}
                    </button>
                </form>

                <AnimatePresence mode="wait">
                    {status === 'success' && (
                        <motion.div
                            id="waitlist-success-compact"
                            role="status"
                            aria-live="polite"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span>🎉 Thanks for joining! We'll notify you when we launch.</span>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            id="waitlist-error-compact"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span>{errorMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Default variant
    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="waitlist-heading" noValidate>
                <h2 id="waitlist-heading" className="sr-only">Join the waitlist</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                        <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                        <input
                            id="waitlist-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/5 border border-foreground/10 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
                            required
                            aria-required="true"
                            aria-invalid={status === 'error'}
                            aria-describedby={status === 'error' ? 'waitlist-error' : status === 'success' ? 'waitlist-success' : undefined}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-orange-600 to-orange-600 text-foreground font-semibold hover:from-orange-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg whitespace-nowrap"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Joining...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Joined!
                            </>
                        ) : (
                            'Join Waitlist'
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'success' && (
                        <motion.div
                            id="waitlist-success"
                            role="status"
                            aria-live="polite"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 flex items-start gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                                <p className="font-semibold">Successfully joined the waitlist!</p>
                                <p className="text-sm opacity-90 mt-1">
                                    Check your email for confirmation and early bird offer details.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            id="waitlist-error"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                                <p className="font-semibold">Oops! Something went wrong</p>
                                <p className="text-sm opacity-90 mt-1">{errorMessage}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-700 dark:text-orange-300 font-medium">
                    🎁 Early Bird Offer
                </div>
                <span>50% off for the first 3 months!</span>
            </div>
        </div>
    );
}
