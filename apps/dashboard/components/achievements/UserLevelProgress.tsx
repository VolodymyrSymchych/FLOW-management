'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';

export interface UserLevel {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXP: number;
}

export interface UserLevelProgressProps {
    userLevel: UserLevel;
    className?: string;
}

export function UserLevelProgress({ userLevel, className = '' }: UserLevelProgressProps) {
    const progressPercentage = (userLevel.currentXP / userLevel.xpToNextLevel) * 100;

    return (
        <div className={`glass-medium rounded-xl p-6 border border-white/10 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                            Level {userLevel.currentLevel}
                        </h3>
                        <p className="text-xs text-text-tertiary">
                            {userLevel.totalXP.toLocaleString()} total XP
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-1 text-primary">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                            {userLevel.currentXP} / {userLevel.xpToNextLevel} XP
                        </span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5">
                        to Level {userLevel.currentLevel + 1}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient"
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span>Level {userLevel.currentLevel}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                    <span>Level {userLevel.currentLevel + 1}</span>
                </div>
            </div>

            {/* Level Perks */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-text-primary mb-2">Next Level Perks:</p>
                <ul className="space-y-1">
                    <li className="text-xs text-text-secondary flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        Unlock exclusive badge
                    </li>
                    <li className="text-xs text-text-secondary flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        +50 bonus XP multiplier
                    </li>
                </ul>
            </div>
        </div>
    );
}
