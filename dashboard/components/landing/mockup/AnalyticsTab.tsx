'use client';

import { TrendingUp, TrendingDown, Shield, DollarSign } from "lucide-react";
import { TabShell, TabHeader, MiniStat, Card, SectionTitle } from "./shared";
import { mockInsights } from "../landingAiMocks";

const scopeCreep = [2, 3, 2, 4, 5, 4, 6, 7, 5, 8, 7, 9];   // per month
const velocity = [28, 32, 30, 35, 33, 38, 41, 37, 42, 44, 40, 45];
const riskDonut = { healthy: 50, onTrack: 20, atRisk: 18, delayed: 12 };
const budgetBars = [
    { name: 'Acme',      used: 68, over: false },
    { name: 'Northwind', used: 42, over: false },
    { name: 'Hatch',     used: 91, over: false },
    { name: 'Meridian',  used: 108, over: true },
    { name: 'Orbital',   used: 55, over: false },
];

export function AnalyticsTab() {
    return (
        <TabShell>
            <TabHeader
                title="Analytics"
                subtitle="Scope, velocity, and budget trends · last 12 weeks"
                right={<span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/70">Last 12 weeks</span>}
            />

            <div className="mb-4 grid grid-cols-4 gap-2.5">
                <MiniStat label="Revenue saved" value="$18,420" hint="↑ 22% vs last quarter" tone="positive" />
                <MiniStat label="Flags triggered" value="27" hint="3 this week" />
                <MiniStat label="Avg velocity" value="38 pts" hint="steady" />
                <MiniStat label="Budget variance" value="−4.1%" hint="under by $2,140" tone="positive" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Scope creep line */}
                <Card className="p-3">
                    <SectionTitle right={<span className="text-[9px] text-emerald-600">↑ trend</span>}>Scope requests flagged</SectionTitle>
                    <svg viewBox="0 0 240 70" className="w-full">
                        <polyline
                            fill="none"
                            stroke="url(#grad1)"
                            strokeWidth="2"
                            points={scopeCreep.map((v, i) => `${(i / (scopeCreep.length - 1)) * 240},${70 - (v / 10) * 60}`).join(' ')}
                        />
                        <defs>
                            <linearGradient id="grad1" x1="0" x2="1">
                                <stop offset="0%" stopColor="#fb923c" />
                                <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                        </defs>
                    </svg>
                </Card>

                {/* Velocity bars */}
                <Card className="p-3">
                    <SectionTitle right={<span className="text-[9px] text-sky-600">avg 38</span>}>Team velocity (pts/wk)</SectionTitle>
                    <div className="flex h-16 items-end gap-1">
                        {velocity.map((v, i) => (
                            <div key={i} className="flex-1 rounded-sm bg-sky-500/70 dark:bg-sky-400/70" style={{ height: `${(v / 50) * 100}%` }} />
                        ))}
                    </div>
                </Card>

                {/* Risk donut */}
                <Card className="p-3">
                    <SectionTitle>Project risk distribution</SectionTitle>
                    <div className="flex items-center gap-3">
                        <svg viewBox="0 0 42 42" className="h-20 w-20 -rotate-90">
                            {(() => {
                                const segs = [
                                    { v: riskDonut.healthy,  c: '#10b981' },
                                    { v: riskDonut.onTrack,  c: '#0ea5e9' },
                                    { v: riskDonut.atRisk,   c: '#f59e0b' },
                                    { v: riskDonut.delayed,  c: '#f43f5e' },
                                ];
                                const total = segs.reduce((s, x) => s + x.v, 0);
                                let off = 0;
                                return segs.map((s, i) => {
                                    const pct = (s.v / total) * 100;
                                    const circ = (
                                        <circle
                                            key={i}
                                            cx="21" cy="21" r="15.9" fill="transparent"
                                            stroke={s.c} strokeWidth="6"
                                            strokeDasharray={`${pct} ${100 - pct}`}
                                            strokeDashoffset={-off}
                                            pathLength={100}
                                        />
                                    );
                                    off += pct;
                                    return circ;
                                });
                            })()}
                        </svg>
                        <div className="space-y-1 text-[10px]">
                            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Healthy · 50%</div>
                            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-sky-500" />On track · 20%</div>
                            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-500" />At risk · 18%</div>
                            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500" />Delayed · 12%</div>
                        </div>
                    </div>
                </Card>

                {/* Budget usage */}
                <Card className="p-3">
                    <SectionTitle>Budget usage by project</SectionTitle>
                    <div className="space-y-1.5">
                        {budgetBars.map((b) => (
                            <div key={b.name}>
                                <div className="mb-0.5 flex justify-between text-[10px]">
                                    <span className="text-gray-700 dark:text-white/80">{b.name}</span>
                                    <span className={`font-bold ${b.over ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>{b.used}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                    <div className={`h-full rounded-full ${b.over ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, b.used)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
                {mockInsights.map((ins) => {
                    const toneIcon: Record<string, typeof TrendingUp> = {
                        positive: TrendingUp, attention: Shield, alert: TrendingDown, neutral: DollarSign,
                    };
                    const Icon = toneIcon[ins.tone];
                    return (
                        <div key={ins.title} className="rounded-lg border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-[#1C1C1C]">
                            <div className="mb-0.5 flex items-center gap-1">
                                <Icon className="h-3 w-3 text-orange-500" />
                                <p className="text-[10px] font-semibold text-gray-900 dark:text-white">{ins.title}</p>
                            </div>
                            <p className="text-[9px] leading-snug text-gray-600 dark:text-white/60">{ins.detail}</p>
                        </div>
                    );
                })}
            </div>
        </TabShell>
    );
}
