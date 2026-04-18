'use client';

import { useState, useMemo } from 'react';
import { BurndownChart, BurndownDataPoint } from '@/components/charts/BurndownChart';
import { SprintSelector, Sprint } from '@/components/charts/SprintSelector';
import { TrendingDown, Target, Zap, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

// Mock data - in production, this would come from API
const MOCK_SPRINTS: Sprint[] = [
    {
        id: 'sprint-1',
        name: 'Sprint 1 - Foundation',
        startDate: '2026-01-06',
        endDate: '2026-01-19',
        status: 'completed'
    },
    {
        id: 'sprint-2',
        name: 'Sprint 2 - Core Features',
        startDate: '2026-01-20',
        endDate: '2026-02-02',
        status: 'active'
    },
    {
        id: 'sprint-3',
        name: 'Sprint 3 - Polish',
        startDate: '2026-02-03',
        endDate: '2026-02-16',
        status: 'planned'
    },
];

const MOCK_BURNDOWN_DATA: Record<string, BurndownDataPoint[]> = {
    'sprint-1': [
        { date: '2026-01-06', remainingPoints: 50, idealPoints: 50 },
        { date: '2026-01-07', remainingPoints: 47, idealPoints: 46.4 },
        { date: '2026-01-08', remainingPoints: 43, idealPoints: 42.9 },
        { date: '2026-01-09', remainingPoints: 38, idealPoints: 39.3 },
        { date: '2026-01-10', remainingPoints: 35, idealPoints: 35.7 },
        { date: '2026-01-13', remainingPoints: 30, idealPoints: 32.1 },
        { date: '2026-01-14', remainingPoints: 25, idealPoints: 28.6 },
        { date: '2026-01-15', remainingPoints: 20, idealPoints: 25 },
        { date: '2026-01-16', remainingPoints: 14, idealPoints: 21.4 },
        { date: '2026-01-17', remainingPoints: 8, idealPoints: 17.9 },
        { date: '2026-01-19', remainingPoints: 0, idealPoints: 0 },
    ],
    'sprint-2': [
        { date: '2026-01-20', remainingPoints: 55, idealPoints: 55, scopeChange: 5 },
        { date: '2026-01-21', remainingPoints: 52, idealPoints: 51 },
        { date: '2026-01-22', remainingPoints: 48, idealPoints: 47 },
        { date: '2026-01-23', remainingPoints: 45, idealPoints: 43 },
        { date: '2026-01-24', remainingPoints: 40, idealPoints: 39 },
        { date: '2026-01-27', remainingPoints: 35, idealPoints: 35 },
        { date: '2026-01-28', remainingPoints: 30, idealPoints: 31 },
        { date: '2026-01-29', remainingPoints: 26, idealPoints: 27 },
        { date: '2026-01-30', remainingPoints: 22, idealPoints: 23 },
        { date: '2026-01-31', remainingPoints: 18, idealPoints: 19 },
        { date: '2026-02-02', remainingPoints: 0, idealPoints: 0 },
    ],
    'sprint-3': [],
};

export default function BurndownPage() {
    const [selectedSprintId, setSelectedSprintId] = useState('sprint-2');

    const selectedSprint = MOCK_SPRINTS.find(s => s.id === selectedSprintId);
    const burndownData = MOCK_BURNDOWN_DATA[selectedSprintId] || [];

    const statistics = useMemo(() => {
        if (!selectedSprint || burndownData.length === 0) {
            return {
                totalPoints: 0,
                completedPoints: 0,
                remainingPoints: 0,
                velocity: 0,
                daysRemaining: 0,
                projectedCompletion: null as string | null,
                onTrack: true,
            };
        }

        const totalPoints = burndownData[0]?.remainingPoints || 0;
        const currentRemaining = burndownData[burndownData.length - 1]?.remainingPoints || 0;
        const completedPoints = totalPoints - currentRemaining;

        // Calculate velocity (points per day)
        const daysElapsed = burndownData.length - 1;
        const velocity = daysElapsed > 0 ? completedPoints / daysElapsed : 0;

        // Calculate days remaining in sprint
        const today = new Date();
        const endDate = parseISO(selectedSprint.endDate);
        const daysRemaining = differenceInDays(endDate, today);

        // Project completion date based on current velocity
        const daysNeeded = velocity > 0 ? Math.ceil(currentRemaining / velocity) : 0;
        const projectedDate = new Date(today);
        projectedDate.setDate(projectedDate.getDate() + daysNeeded);

        const onTrack = projectedDate <= endDate;

        return {
            totalPoints,
            completedPoints,
            remainingPoints: currentRemaining,
            velocity: Math.round(velocity * 10) / 10,
            daysRemaining: Math.max(0, daysRemaining),
            projectedCompletion: daysNeeded > 0 ? format(projectedDate, 'MMM dd, yyyy') : null,
            onTrack,
        };
    }, [selectedSprint, burndownData]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <TrendingDown className="w-7 h-7 text-primary" />
                    Burndown Chart
                </h1>
                <p className="text-text-secondary mt-1">
                    Track sprint progress and visualize remaining work
                </p>
            </div>

            {/* Sprint Selector */}
            <SprintSelector
                sprints={MOCK_SPRINTS}
                selectedSprintId={selectedSprintId}
                onSelectSprint={setSelectedSprintId}
                className="max-w-md"
            />

            {selectedSprint && burndownData.length > 0 ? (
                <>
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-medium rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-tertiary">Total Points</p>
                                    <p className="text-2xl font-bold text-text-primary">{statistics.totalPoints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-medium rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-tertiary">Completed</p>
                                    <p className="text-2xl font-bold text-text-primary">{statistics.completedPoints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-medium rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-tertiary">Remaining</p>
                                    <p className="text-2xl font-bold text-text-primary">{statistics.remainingPoints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-medium rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-tertiary">Velocity</p>
                                    <p className="text-2xl font-bold text-text-primary">{statistics.velocity}<span className="text-sm text-text-tertiary ml-1">/day</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projection Alert */}
                    {!statistics.onTrack && statistics.projectedCompletion && (
                        <div className="glass-medium rounded-xl p-4 border border-warning/30 bg-warning/5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-warning">Sprint May Overrun</p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Based on current velocity, projected completion is <span className="font-semibold text-text-primary">{statistics.projectedCompletion}</span>
                                        {' '}({statistics.daysRemaining} days remaining in sprint)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div className="glass-medium rounded-xl p-6 border border-white/10" style={{ height: '500px' }}>
                        <BurndownChart
                            data={burndownData}
                            sprintName={selectedSprint.name}
                        />
                    </div>

                    {/* Sprint Info */}
                    <div className="glass-medium rounded-xl p-4 border border-white/10">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Sprint Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-text-tertiary">Start Date</p>
                                <p className="text-text-primary font-medium">{format(parseISO(selectedSprint.startDate), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-text-tertiary">End Date</p>
                                <p className="text-text-primary font-medium">{format(parseISO(selectedSprint.endDate), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-text-tertiary">Days Remaining</p>
                                <p className="text-text-primary font-medium">{statistics.daysRemaining} days</p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass-medium rounded-xl p-12 border border-white/10 text-center">
                    <TrendingDown className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <p className="text-lg font-semibold text-text-primary">No Data Available</p>
                    <p className="text-sm text-text-tertiary mt-2">
                        {selectedSprint?.status === 'planned'
                            ? 'This sprint hasn\'t started yet.'
                            : 'No burndown data available for this sprint.'}
                    </p>
                </div>
            )}
        </div>
    );
}
