'use client';

import { Plus, Search, AlertTriangle } from "lucide-react";
import { TabShell, TabHeader, MiniStat, Card, RiskBadge, AvatarStack, ProgressBar } from "./shared";
import { mockProjects, mockTeam } from "../landingAiMocks";

const filters = ['All', 'Healthy', 'At Risk', 'Delayed', 'Completed'];

export function ProjectsTab() {
    const atRisk = mockProjects.filter((p) => p.health === 'At Risk' || p.health === 'Delayed').length;
    const completed = mockProjects.filter((p) => p.health === 'Completed').length;
    const totalBudget = mockProjects.reduce((s, p) => s + p.budget, 0);

    return (
        <TabShell>
            <TabHeader
                title="Projects"
                subtitle={`${mockProjects.length} total · ${atRisk} needs attention`}
                right={
                    <>
                        <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#1C1C1C]">
                            <Search className="h-3 w-3 text-gray-400" />
                            <span className="text-[10px] text-gray-400">Search…</span>
                        </div>
                        <button type="button" className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">
                            <Plus className="h-3 w-3" /> New project
                        </button>
                    </>
                }
            />

            <div className="mb-4 grid grid-cols-4 gap-2.5">
                <MiniStat label="Total projects" value={`${mockProjects.length}`} hint={`${mockProjects.length - completed} active`} />
                <MiniStat label="Total budget" value={`$${(totalBudget / 1000).toFixed(1)}k`} hint="tracked this quarter" />
                <MiniStat label="At risk" value={`${atRisk}`} hint="needs intervention" tone="warn" />
                <MiniStat label="Avg progress" value={`${Math.round(mockProjects.reduce((s, p) => s + p.progress, 0) / mockProjects.length)}%`} hint="↑ 4% week-over-week" tone="positive" />
            </div>

            <div className="mb-3 flex gap-1.5">
                {filters.map((f, i) => (
                    <button
                        key={f}
                        type="button"
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                            i === 0
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/70'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
                {mockProjects.map((p) => {
                    const team = mockTeam.filter((t) => p.team.includes(t.id));
                    return (
                        <Card key={p.id} className="p-3">
                            <div className="mb-2 flex items-start justify-between">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${p.colorDot}/20`}>
                                    <div className={`h-3 w-3 rounded-sm ${p.colorDot}`} />
                                </div>
                                <RiskBadge health={p.health} />
                            </div>
                            <h3 className="mb-0.5 line-clamp-1 text-[12px] font-bold text-gray-900 dark:text-white">{p.name}</h3>
                            <p className="mb-2.5 text-[10px] text-gray-500 dark:text-white/60">{p.client} · {p.type}</p>
                            <ProgressBar value={p.progress} colorClass={p.health === 'At Risk' ? 'bg-amber-500' : p.health === 'Delayed' ? 'bg-rose-500' : p.health === 'Completed' ? 'bg-violet-500' : 'bg-emerald-500'} />
                            <div className="mt-1 flex justify-between text-[9px] text-gray-500 dark:text-white/60">
                                <span>{p.progress}% complete</span>
                                <span>${(p.budget / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-white/5">
                                <AvatarStack members={team} size={16} />
                                <div className="flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-white/60">
                                    {p.overdue > 0 && (
                                        <span className="flex items-center gap-0.5 text-rose-600">
                                            <AlertTriangle className="h-2.5 w-2.5" /> {p.overdue}
                                        </span>
                                    )}
                                    <span>{p.deadline}</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                <button type="button" className="flex min-h-[140px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 text-[11px] font-semibold text-gray-500 transition hover:border-orange-400 hover:text-orange-600 dark:border-white/10 dark:bg-transparent dark:text-white/50">
                    <Plus className="mr-1 h-3.5 w-3.5" /> New project
                </button>
            </div>
        </TabShell>
    );
}
