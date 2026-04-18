'use client';

import { AlertTriangle, Calendar, Flame } from "lucide-react";
import { mockSprint } from "../landingAiMocks";
import { Card, MiniStat, TabHeader, TabShell } from "./shared";

export function BurndownTab() {
    const width = 360;
    const height = 160;
    const max = mockSprint.totalPoints;
    const points = mockSprint.curve.length - 1;

    const toPoint = (day: number, value: number) => {
        const x = (day / points) * width;
        const y = height - (value / max) * (height - 12) - 6;
        return `${x},${y}`;
    };

    const idealPath = mockSprint.curve.map((point) => toPoint(point.day, point.ideal)).join(' ');
    const actualPath = mockSprint.curve
        .filter((point) => point.actual !== null)
        .map((point) => toPoint(point.day, point.actual ?? 0))
        .join(' ');

    return (
        <TabShell>
            <TabHeader
                title="Burndown"
                subtitle={`${mockSprint.startDate} → ${mockSprint.endDate}`}
                right={
                    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/70">
                        <Calendar className="h-3 w-3" />
                        {mockSprint.name}
                    </div>
                }
            />

            <div className="mb-4 grid grid-cols-4 gap-2.5">
                <MiniStat label="Total scope" value={`${mockSprint.totalPoints} pts`} hint={mockSprint.status} />
                <MiniStat label="Completed" value={`${mockSprint.completedPoints} pts`} hint={`${mockSprint.daysRemaining} days left`} tone="positive" />
                <MiniStat label="Velocity" value={`${mockSprint.velocity.toFixed(1)}/day`} hint="current sprint pace" />
                <MiniStat
                    label="Projection"
                    value={mockSprint.projectedOverrun ? "Behind" : "On track"}
                    hint={mockSprint.projectedCompletion}
                    tone={mockSprint.projectedOverrun ? "warn" : "positive"}
                />
            </div>

            <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-gray-900 dark:text-white">Sprint 14 burndown curve</p>
                        <p className="text-[10px] text-gray-500 dark:text-white/60">Ideal vs actual remaining story points</p>
                    </div>
                    {mockSprint.projectedOverrun && (
                        <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[9px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                            <AlertTriangle className="h-3 w-3" />
                            Projected to spill 3 days
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-[1fr_170px] gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#151515]">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                            {Array.from({ length: 5 }).map((_, index) => {
                                const y = 8 + index * ((height - 16) / 4);
                                return <line key={index} x1="0" x2={width} y1={y} y2={y} stroke="rgba(148,163,184,0.2)" strokeWidth="1" />;
                            })}
                            <polyline fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" points={idealPath} />
                            <polyline fill="none" stroke="#f97316" strokeWidth="3" points={actualPath} />
                            {mockSprint.curve.filter((point) => point.actual !== null).map((point) => (
                                <circle key={point.day} cx={(point.day / points) * width} cy={height - ((point.actual ?? 0) / max) * (height - 12) - 6} r="3.5" fill="#f97316" />
                            ))}
                        </svg>
                        <div className="mt-2 flex items-center justify-between text-[9px] text-gray-500 dark:text-white/50">
                            <span>Day 1</span>
                            <span>Mid sprint</span>
                            <span>Done</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1C]">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/60">Remaining</p>
                            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{mockSprint.totalPoints - mockSprint.completedPoints} pts</p>
                            <p className="mt-1 text-[10px] text-gray-500 dark:text-white/60">ideal line is already at 13 pts</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1C]">
                            <p className="flex items-center gap-1 text-[10px] font-semibold text-gray-900 dark:text-white">
                                <Flame className="h-3 w-3 text-orange-500" />
                                Sprint note
                            </p>
                            <p className="mt-1 text-[10px] leading-snug text-gray-600 dark:text-white/65">
                                OAuth migration slowed the first week. Scope Guard already flagged follow-on asks tied to Meridian and Northwind.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </TabShell>
    );
}
