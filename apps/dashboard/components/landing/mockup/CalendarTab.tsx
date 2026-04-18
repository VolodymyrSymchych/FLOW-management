'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";
import { TabShell, TabHeader, Card } from "./shared";
import { mockEvents } from "../landingAiMocks";

const today = 18;
const daysInMonth = 30;
// April 2026 starts on Wednesday (index 3 in Mo–Su week)
const startOffset = 2;

export function CalendarTab() {
    const cells: Array<{ day: number | null; events: typeof mockEvents }> = [];
    for (let i = 0; i < startOffset; i++) cells.push({ day: null, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, events: mockEvents.filter((e) => e.day === d) });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, events: [] });

    const upcoming = mockEvents.filter((e) => e.day >= today).slice(0, 6);

    return (
        <TabShell>
            <TabHeader
                title="April 2026"
                subtitle={`${mockEvents.length} events this month`}
                right={
                    <>
                        <button className="rounded-md border border-gray-200 bg-white p-1 dark:border-white/10 dark:bg-[#1C1C1C]"><ChevronLeft className="h-3 w-3 text-gray-600 dark:text-white/70" /></button>
                        <button className="rounded-md border border-gray-200 bg-white p-1 dark:border-white/10 dark:bg-[#1C1C1C]"><ChevronRight className="h-3 w-3 text-gray-600 dark:text-white/70" /></button>
                        <button className="rounded-lg bg-gray-900 px-2.5 py-1 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">Today</button>
                    </>
                }
            />

            <div className="grid grid-cols-[1fr_220px] gap-3">
                <div>
                    <div className="mb-1 grid grid-cols-7 gap-1 text-center">
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                            <div key={d} className="text-[9px] font-bold uppercase text-gray-500 dark:text-white/60">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((cell, idx) => (
                            <div
                                key={idx}
                                className={`relative h-14 rounded-md border p-1 text-left ${
                                    cell.day === null
                                        ? 'border-transparent'
                                        : cell.day === today
                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                                            : 'border-gray-200 bg-white dark:border-white/10 dark:bg-[#1C1C1C]'
                                }`}
                            >
                                {cell.day !== null && (
                                    <>
                                        <div className={`text-[10px] font-bold ${cell.day === today ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-white/80'}`}>{cell.day}</div>
                                        <div className="mt-0.5 space-y-0.5">
                                            {cell.events.slice(0, 2).map((e) => (
                                                <div key={e.id} className={`truncate rounded px-1 py-[1px] text-[8px] font-semibold text-white ${e.color}`}>
                                                    {e.title}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-white/80">Upcoming</h3>
                    <Card>
                        {upcoming.map((e, i) => (
                            <div key={e.id} className={`flex items-start gap-2 px-2.5 py-2 ${i > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                                <div className={`mt-0.5 h-7 w-7 flex-shrink-0 rounded-md text-center text-[9px] font-bold leading-tight text-white ${e.color}`}>
                                    <div className="pt-0.5 text-[8px] opacity-80">Apr</div>
                                    <div className="text-[10px]">{e.day}</div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-semibold text-gray-900 dark:text-white">{e.title}</p>
                                    <p className="text-[9px] text-gray-500 dark:text-white/60">{e.time} · {e.type}</p>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </TabShell>
    );
}
