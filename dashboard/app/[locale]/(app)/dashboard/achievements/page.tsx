'use client';

import { useState } from 'react';
import { Trophy, Target, Shield, Users, CheckSquare, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { AchievementCard, Achievement } from '@/components/achievements/AchievementCard';
import { AchievementNotification } from '@/components/achievements/AchievementNotification';
import { UserLevelProgress, UserLevel } from '@/components/achievements/UserLevelProgress';

// Mock user level data
const USER_LEVEL: UserLevel = {
    currentLevel: 5,
    currentXP: 750,
    xpToNextLevel: 1000,
    totalXP: 4750,
};

// Mock achievements data
const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-project',
        name: 'First Steps',
        description: 'Complete your first project analysis',
        icon: Target,
        category: 'projects',
        points: 50,
        requirement: 1,
        progress: 1,
        unlocked: true,
        unlockedAt: '2 weeks ago',
        rarity: 'common',
    },
    {
        id: 'project-master',
        name: 'Project Master',
        description: 'Successfully complete 10 project analyses',
        icon: Trophy,
        category: 'projects',
        points: 200,
        requirement: 10,
        progress: 7,
        unlocked: false,
        rarity: 'rare',
    },
    {
        id: 'scope-detective',
        name: 'Scope Detective',
        description: 'Detect and prevent 25 scope changes',
        icon: Shield,
        category: 'scope',
        points: 300,
        requirement: 25,
        progress: 18,
        unlocked: false,
        rarity: 'epic',
    },
    {
        id: 'scope-guardian',
        name: 'Scope Guardian',
        description: 'Detect 100 scope changes across all projects',
        icon: Shield,
        category: 'scope',
        points: 500,
        requirement: 100,
        progress: 45,
        unlocked: false,
        rarity: 'legendary',
    },
    {
        id: 'budget-saver',
        name: 'Budget Guardian',
        description: 'Stay under budget on 5 consecutive projects',
        icon: DollarSign,
        category: 'budget',
        points: 250,
        requirement: 5,
        progress: 3,
        unlocked: false,
        rarity: 'epic',
    },
    {
        id: 'team-player',
        name: 'Team Player',
        description: 'Collaborate on 15 team projects',
        icon: Users,
        category: 'team',
        points: 150,
        requirement: 15,
        progress: 15,
        unlocked: true,
        unlockedAt: '1 week ago',
        rarity: 'rare',
    },
    {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Complete 20 tasks before their deadline',
        icon: CheckSquare,
        category: 'tasks',
        points: 100,
        requirement: 20,
        progress: 12,
        unlocked: false,
        rarity: 'common',
    },
    {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 30-day activity streak',
        icon: Zap,
        category: 'tasks',
        points: 400,
        requirement: 30,
        progress: 22,
        unlocked: false,
        rarity: 'legendary',
    },
    {
        id: 'velocity-king',
        name: 'Velocity King',
        description: 'Achieve 10+ story points per day for a sprint',
        icon: TrendingUp,
        category: 'tasks',
        points: 350,
        requirement: 1,
        progress: 0,
        unlocked: false,
        rarity: 'epic',
    },
];

const CATEGORIES = [
    { id: 'all', label: 'All Achievements', icon: Trophy },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'scope', label: 'Scope Management', icon: Shield },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

export default function AchievementsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const filteredAchievements = ACHIEVEMENTS.filter(
        achievement => selectedCategory === 'all' || achievement.category === selectedCategory
    );

    const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
    const totalPoints = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

    const handleAchievementClick = (achievement: Achievement) => {
        if (achievement.unlocked) {
            setSelectedAchievement(achievement);
            setShowNotification(true);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-primary" />
                    Achievements
                </h1>
                <p className="text-text-secondary mt-1">
                    Track your progress and unlock rewards
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Unlocked</p>
                            <p className="text-2xl font-bold text-text-primary">
                                {unlockedCount} / {ACHIEVEMENTS.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Total Points</p>
                            <p className="text-2xl font-bold text-text-primary">
                                {totalPoints.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Completion</p>
                            <p className="text-2xl font-bold text-text-primary">
                                {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Level Progress */}
            <UserLevelProgress userLevel={USER_LEVEL} />

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(category => {
                    const CategoryIcon = category.icon;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === category.id
                                    ? 'bg-primary/20 text-primary border border-primary/40'
                                    : 'glass-light text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <CategoryIcon className="w-4 h-4" />
                            {category.label}
                        </button>
                    );
                })}
            </div>

            {/* Achievements Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary">
                        {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    </h2>
                    <span className="text-sm text-text-tertiary">
                        {filteredAchievements.filter(a => a.unlocked).length} / {filteredAchievements.length} unlocked
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredAchievements.map(achievement => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onClick={() => handleAchievementClick(achievement)}
                        />
                    ))}
                </div>
            </div>

            {/* Achievement Notification */}
            <AchievementNotification
                achievement={selectedAchievement}
                isOpen={showNotification}
                onClose={() => setShowNotification(false)}
            />
        </div>
    );
}
