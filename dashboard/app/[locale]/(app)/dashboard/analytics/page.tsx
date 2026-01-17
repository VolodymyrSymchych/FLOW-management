'use client';

import { useState } from 'react';
import { BarChart3, Calendar, Download, Filter } from 'lucide-react';
import { ScopeCreepChart } from '@/components/analytics/ScopeCreepChart';
import { VelocityChart } from '@/components/analytics/VelocityChart';
import { RiskDistribution } from '@/components/analytics/RiskDistribution';
import toast from 'react-hot-toast';

type DateRange = '7' | '30' | '90' | 'custom';

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>('30');

    const handleExport = () => {
        toast.success('Analytics exported successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <BarChart3 className="w-7 h-7 text-primary" />
                        Advanced Analytics
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Comprehensive insights into your project performance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="flex items-center gap-2 glass-medium rounded-lg border border-white/10 p-1">
                        <Calendar className="w-4 h-4 text-text-tertiary ml-2" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as DateRange)}
                            className="bg-transparent text-sm text-text-primary pr-8 py-1 focus:outline-none cursor-pointer"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="custom">Custom range</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-semibold"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-text-tertiary mb-1">Total Projects</p>
                    <p className="text-3xl font-bold text-text-primary">48</p>
                    <p className="text-xs text-green-400 mt-1">+12% from last period</p>
                </div>

                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-text-tertiary mb-1">Scope Changes</p>
                    <p className="text-3xl font-bold text-text-primary">127</p>
                    <p className="text-xs text-orange-400 mt-1">+8% from last period</p>
                </div>

                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-text-tertiary mb-1">Avg Velocity</p>
                    <p className="text-3xl font-bold text-text-primary">52.3</p>
                    <p className="text-xs text-green-400 mt-1">+5% from last period</p>
                </div>

                <div className="glass-medium rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-text-tertiary mb-1">Budget Saved</p>
                    <p className="text-3xl font-bold text-text-primary">$2.1M</p>
                    <p className="text-xs text-green-400 mt-1">+18% from last period</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scope Creep Chart */}
                <div className="glass-medium rounded-xl p-6 border border-white/10" style={{ height: '400px' }}>
                    <ScopeCreepChart days={parseInt(dateRange) || 30} />
                </div>

                {/* Velocity Chart */}
                <div className="glass-medium rounded-xl p-6 border border-white/10" style={{ height: '400px' }}>
                    <VelocityChart />
                </div>

                {/* Risk Distribution */}
                <div className="glass-medium rounded-xl p-6 border border-white/10" style={{ height: '400px' }}>
                    <RiskDistribution />
                </div>

                {/* Budget Analysis */}
                <div className="glass-medium rounded-xl p-6 border border-white/10" style={{ height: '400px' }}>
                    <div className="h-full flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">Budget Analysis</h3>
                            <p className="text-sm text-text-tertiary">Spend vs budget by category</p>
                        </div>

                        <div className="flex-1 space-y-4">
                            {[
                                { category: 'Development', spent: 450000, budget: 500000, color: 'bg-blue-500' },
                                { category: 'Design', spent: 180000, budget: 200000, color: 'bg-purple-500' },
                                { category: 'Marketing', spent: 95000, budget: 100000, color: 'bg-green-500' },
                                { category: 'Infrastructure', spent: 120000, budget: 150000, color: 'bg-orange-500' },
                            ].map((item) => {
                                const percentage = (item.spent / item.budget) * 100;
                                return (
                                    <div key={item.category}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-text-primary">{item.category}</span>
                                            <span className="text-sm text-text-secondary">
                                                ${(item.spent / 1000).toFixed(0)}K / ${(item.budget / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="glass-medium rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div>
                            <p className="text-sm font-semibold text-green-400 mb-1">Positive Trend</p>
                            <p className="text-sm text-text-secondary">
                                Team velocity has increased by 15% over the last 3 sprints, indicating improved productivity.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                        <div>
                            <p className="text-sm font-semibold text-orange-400 mb-1">Attention Needed</p>
                            <p className="text-sm text-text-secondary">
                                Scope changes have increased by 8%. Consider tightening requirements gathering process.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div>
                            <p className="text-sm font-semibold text-blue-400 mb-1">Budget Performance</p>
                            <p className="text-sm text-text-secondary">
                                All projects are tracking within 10% of budget, with an average savings of 5%.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                        <div>
                            <p className="text-sm font-semibold text-purple-400 mb-1">Risk Management</p>
                            <p className="text-sm text-text-secondary">
                                75% of projects are in low-medium risk categories, showing effective risk mitigation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
