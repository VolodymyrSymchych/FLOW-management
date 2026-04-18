'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Achievement } from './AchievementCard';
import { useEffect, useState } from 'react';

export interface AchievementNotificationProps {
    achievement: Achievement | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AchievementNotification({
    achievement,
    isOpen,
    onClose
}: AchievementNotificationProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="fixed top-4 right-4 z-50 max-w-md"
                >
                    <div className="glass-medium rounded-2xl p-6 border border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-2xl shadow-primary/20">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-text-secondary" />
                        </button>

                        {/* Confetti effect */}
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            x: '50%',
                                            y: '50%',
                                            opacity: 1,
                                        }}
                                        animate={{
                                            x: `${50 + (Math.random() - 0.5) * 200}%`,
                                            y: `${50 + (Math.random() - 0.5) * 200}%`,
                                            opacity: 0,
                                            rotate: Math.random() * 360,
                                        }}
                                        transition={{ duration: 1.5, delay: i * 0.05 }}
                                        className="absolute w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: ['#0ea5e9', '#a855f7', '#f97316', '#22c55e'][i % 4],
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                <achievement.icon className="w-8 h-8 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
                                        Achievement Unlocked!
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-text-primary mb-1">
                                    {achievement.name}
                                </h3>

                                <p className="text-sm text-text-secondary mb-3">
                                    {achievement.description}
                                </p>

                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                                        <span className="text-sm font-semibold text-primary">
                                            +{achievement.points} points
                                        </span>
                                    </div>
                                    <span className="text-xs text-text-tertiary uppercase">
                                        {achievement.rarity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
