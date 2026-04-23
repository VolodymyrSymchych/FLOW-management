'use client';

import { Clock, Calendar, Play, Square, Download } from "lucide-react";
import { TabShell, TabHeader } from "./shared";

const entries = [
    { task: "Homepage redesign", clockIn: "09:02 AM", clockOut: "12:15 PM", duration: "3h 13m", active: false },
    { task: "Client review session", clockIn: "01:00 PM", clockOut: "02:30 PM", duration: "1h 30m", active: false },
    { task: "UI component library", clockIn: "03:00 PM", clockOut: null, duration: null, active: true },
];

export function AttendanceTab() {
    return (
        <TabShell>
            <TabHeader
                title="Attendance"
                subtitle="Track your working hours and time logs"
                right={
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/80"
                    >
                        <Download className="h-3 w-3" />
                        Export
                    </button>
                }
            />

            {/* Clock section */}
            <div className="mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-4 dark:bg-orange-500/[0.06]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Currently Working</p>
                        <p className="mt-0.5 text-[11px] text-gray-600 dark:text-white/60">
                            Started at 03:00 PM · UI component library
                        </p>
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-xl bg-rose-500/90 px-3 py-2 text-[11px] font-bold text-white"
                    >
                        <Square className="h-3 w-3" />
                        Clock Out
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                    { icon: Clock, label: "Today", value: "4h 43m", color: "text-blue-400" },
                    { icon: Calendar, label: "This Week", value: "22h 10m", color: "text-emerald-400" },
                    { icon: Calendar, label: "This Month", value: "88h 40m", color: "text-violet-400" },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10">
                                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-600 dark:text-white/60">{s.label}</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View toggle */}
            <div className="mb-3 flex gap-1.5">
                {["Daily", "Weekly", "Monthly"].map((v, i) => (
                    <button
                        key={v}
                        type="button"
                        className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                            i === 0
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                : "border border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-transparent dark:text-white/60"
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {/* Time entries table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#1C1C1C]">
                <div className="border-b border-gray-100 px-4 py-2.5 dark:border-white/10">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">Time Entries</p>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]">
                            {["Task", "Clock In", "Clock Out", "Duration"].map((h) => (
                                <th key={h} className="px-4 py-2 text-left text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e) => (
                            <tr key={e.task} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                                <td className="px-4 py-2.5 text-[11px] font-medium text-gray-900 dark:text-white">{e.task}</td>
                                <td className="px-4 py-2.5 text-[11px] text-gray-600 dark:text-white/60">{e.clockIn}</td>
                                <td className="px-4 py-2.5 text-[11px] text-gray-600 dark:text-white/60">
                                    {e.clockOut ?? (
                                        <span className="flex items-center gap-1 text-orange-500">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2.5">
                                    {e.duration ? (
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                            {e.duration}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                                            In progress
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </TabShell>
    );
}
