'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LayoutDashboard, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load Gantt chart
const GanttChartView = dynamic(() => import('@/components/GanttChartView').then(m => ({ default: m.GanttChartView })), {
    ssr: false,
    loading: () => (
        <div className="glass-medium rounded-2xl p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-10 bg-white/10 rounded w-full" />
                <div className="h-96 bg-white/10 rounded w-full" />
            </div>
        </div>
    )
});

type ChartTab = 'kanban' | 'gantt';

export default function ChartsPage() {
    const [activeTab, setActiveTab] = useState<ChartTab>('kanban');

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Charts & Boards</h1>
                    <p className="text-text-secondary mt-1">
                        Visualize your project progress and workflow
                    </p>
                </div>

                <div className="flex p-1 glass-medium rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('kanban')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === 'kanban'
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                        )}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Kanban Board
                    </button>
                    <button
                        onClick={() => setActiveTab('gantt')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === 'gantt'
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                        )}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Gantt Chart
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
                {activeTab === 'kanban' ? (
                    <div className="h-full overflow-y-auto pr-2">
                        <KanbanBoard />
                    </div>
                ) : (
                    <div className="h-full overflow-hidden glass-medium rounded-2xl border border-white/10">
                        <GanttChartView />
                    </div>
                )}
            </div>
        </div>
    );
}
