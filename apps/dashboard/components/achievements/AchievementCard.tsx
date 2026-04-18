'use client';

import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: 'projects' | 'scope' | 'budget' | 'team' | 'tasks';
    points: number;
    requirement: number;
    progress: number;
    unlocked: boolean;
    unlockedAt?: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCardProps {
    achievement: Achievement;
    onClick?: () => void;
}

const rarityColors = {
    common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    rare: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    epic: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    legendary: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
};

const rarityGlow = {
    common: 'shadow-gray-500/20',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-yellow-500/40',
};

export function AchievementCard({ achievement, onClick }: AchievementCardProps) {
    const progressPercentage = Math.min(100, (achievement.progress / achievement.requirement) * 100);
    const isInProgress = achievement.progress > 0 && !achievement.unlocked;

    return (
        <motion.div
            whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={`glass-medium rounded-xl p-6 border transition-all duration-200 cursor-pointer ${achievement.unlocked
                    ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} ${rarityGlow[achievement.rarity]} shadow-lg`
                    : 'border-white/10 opacity-60 grayscale'
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${achievement.unlocked
                        ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
                        : 'bg-white/5'
                    }`}>
                    {achievement.unlocked ? (
                        <achievement.icon className="w-8 h-8 text-white" />
                    ) : (
                        <Lock className="w-8 h-8 text-text-tertiary" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-text-primary truncate">
                                {achievement.name}
                            </h3>
                            <p className="text-xs text-text-tertiary uppercase tracking-wide">
                                {achievement.rarity}
                            </p>
                        </div>
                        {achievement.unlocked && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-xs font-semibold text-green-400">Unlocked</span>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {achievement.description}
                    </p>

                    {/* Progress */}
                    {!achievement.unlocked && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">Progress</span>
                                <span className="text-text-secondary font-semibold">
                                    {achievement.progress} / {achievement.requirement}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className={`h-full ${isInProgress
                                            ? 'bg-gradient-to-r from-primary to-secondary'
                                            : 'bg-white/10'
                                        }`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Points & Date */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-text-tertiary">
                            {achievement.points} points
                        </span>
                        {achievement.unlocked && achievement.unlockedAt && (
                            <span className="text-xs text-text-tertiary">
                                Unlocked {achievement.unlockedAt}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
