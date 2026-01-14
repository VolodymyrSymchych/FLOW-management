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
                <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
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
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>🎉 Thanks for joining! We'll notify you when we launch.</span>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                            required
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg whitespace-nowrap"
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
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-start gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Successfully joined the waitlist!</p>
                                <p className="text-sm text-green-400/80 mt-1">
                                    Check your email for confirmation and early bird offer details.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Oops! Something went wrong</p>
                                <p className="text-sm text-red-400/80 mt-1">{errorMessage}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-medium">
                    🎁 Early Bird Offer
                </div>
                <span>50% off for the first 3 months!</span>
            </div>
        </div>
    );
}
