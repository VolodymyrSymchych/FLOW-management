'use client';

import { TrendingUp, TrendingDown, DollarSign, Shield, Activity } from "lucide-react";
import { TabShell, TabHeader, MiniStat, Card, SectionTitle, RiskBadge, AvatarStack, ProgressBar } from "./shared";
import { mockProjects, mockTeam, mockInsights } from "../landingAiMocks";

const pulse = [42, 48, 44, 58, 54, 63, 68];
const activity = [
    { actor: 'Sara', action: 'approved the portal nav pass', time: '5m ago' },
    { actor: 'Marco', action: 'flagged Northwind auth drift', time: '22m ago' },
    { actor: 'Elena', action: 'shipped Meridian webhook fixes', time: '1h ago' },
];

export function DashboardTab() {
    const active = mockProjects.filter((p) => p.health !== 'Completed').slice(0, 4);
    return (
        <TabShell>
            <TabHeader
                title="Good afternoon, John"
                subtitle="Here's what's happening across your workspace today."
                right={<span className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/75">April 2026</span>}
            />

            <div className="mb-4 grid grid-cols-4 gap-2.5">
                <MiniStat label="Revenue MTD" value="$24,500" hint="↑ 12% vs last month" tone="positive" />
                <MiniStat label="Scope Saved" value="$4,260" hint="3 flagged requests" tone="positive" />
                <MiniStat label="Active Projects" value="5" hint="2 at risk" tone="warn" />
                <MiniStat label="On-time Rate" value="94%" hint="↑ 3 pts this quarter" tone="positive" />
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                <div>
                    <SectionTitle right={<span className="text-[10px] text-gray-500 dark:text-white/60">5 active</span>}>Active Projects</SectionTitle>
                    <Card>
                        {active.map((p, i) => {
                            const team = mockTeam.filter((t) => p.team.includes(t.id));
                            return (
                                <div
                                    key={p.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-gray-100 dark:border-white/5" : ""}`}
                                >
                                    <div className={`h-2 w-2 flex-shrink-0 rounded-full ${p.colorDot}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{p.name}</p>
                                        <p className="text-[10px] text-gray-600 dark:text-white/70">{p.client} · ${p.budget.toLocaleString()}</p>
                                    </div>
                                    <div className="w-16">
                                        <ProgressBar value={p.progress} colorClass={p.health === 'At Risk' ? 'bg-amber-500' : p.health === 'Delayed' ? 'bg-rose-500' : 'bg-emerald-500'} />
                                        <p className="mt-0.5 text-right text-[9px] text-gray-500 dark:text-white/60">{p.progress}%</p>
                                    </div>
                                    <AvatarStack members={team} size={18} />
                                    <RiskBadge health={p.health} />
                                </div>
                            );
                        })}
                    </Card>
                </div>

                <div className="space-y-3">
                    <Card className="p-3">
                        <SectionTitle right={<span className="text-[9px] text-orange-500">7d</span>}>Workspace Pulse</SectionTitle>
                        <div className="flex items-end gap-1.5">
                            {pulse.map((value, index) => (
                                <div key={index} className="flex-1">
                                    <div className="rounded-t-sm bg-orange-500/20" style={{ height: `${value}px` }}>
                                        <div className="h-full rounded-t-sm bg-orange-500" style={{ opacity: 0.82 + index * 0.02 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600">
                            <Activity className="h-3 w-3" />
                            +12% delivery rhythm vs last week
                        </div>
                    </Card>

                    <div>
                        <SectionTitle>AI Insights</SectionTitle>
                        <div className="space-y-2">
                            {mockInsights.slice(0, 3).map((ins) => {
                                const tone: Record<string, { cls: string; Icon: typeof TrendingUp }> = {
                                    positive:  { cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10', Icon: TrendingUp },
                                    attention: { cls: 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10',       Icon: Shield },
                                    alert:     { cls: 'border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10',            Icon: TrendingDown },
                                    neutral:   { cls: 'border-gray-200 bg-white dark:border-white/10 dark:bg-[#1C1C1C]',                    Icon: DollarSign },
                                };
                                const { cls, Icon } = tone[ins.tone];
                                return (
                                    <div key={ins.title} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 ${cls}`}>
                                        <Icon className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-700 dark:text-white/80" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold text-gray-900 dark:text-white">{ins.title}</p>
                                            <p className="text-[10px] leading-snug text-gray-600 dark:text-white/70">{ins.detail}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Card>
                        <div className="px-3 py-2">
                            <SectionTitle>Recent Activity</SectionTitle>
                        </div>
                        {activity.map((item, index) => (
                            <div key={item.actor + item.time} className={`px-3 py-2 ${index > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                                <p className="text-[10px] font-semibold text-gray-900 dark:text-white">{item.actor}</p>
                                <p className="text-[10px] text-gray-600 dark:text-white/70">{item.action}</p>
                                <p className="mt-0.5 text-[9px] text-gray-500 dark:text-white/50">{item.time}</p>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </TabShell>
    );
}
