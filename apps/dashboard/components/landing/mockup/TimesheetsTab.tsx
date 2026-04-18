'use client';

import { Fragment } from "react";
import { TabShell, TabHeader, Card, ProgressBar } from "./shared";
import { mockTimesheet } from "../landingAiMocks";

const categoryColors: Record<string, string> = {
    Development: 'bg-sky-500',
    Design:      'bg-orange-500',
    Meetings:    'bg-violet-500',
    Review:      'bg-emerald-500',
    Admin:       'bg-amber-500',
};

const days = ['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18'];
const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9 → 18

export function TimesheetsTab() {
    const totalByCat = mockTimesheet.reduce<Record<string, number>>((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.hours;
        return acc;
    }, {});
    const total = Object.values(totalByCat).reduce((a, b) => a + b, 0);
    const target = 40;

    return (
        <TabShell>
            <TabHeader
                title="Timesheets"
                subtitle={`Week of April 14 · ${total.toFixed(1)}h / ${target}h`}
                right={<button className="rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">Log time</button>}
            />

            <div className="grid grid-cols-[1fr_200px] gap-3">
                <Card className="p-3">
                    <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(5, 1fr)` }}>
                        <div />
                        {days.map((d) => <div key={d} className="text-center text-[9px] font-bold text-gray-600 dark:text-white/70">{d}</div>)}
                        {hours.map((h) => (
                            <Fragment key={`row-${h}`}>
                                <div className="pr-1 text-right text-[9px] text-gray-400 dark:text-white/40">{h}:00</div>
                                {days.map((_, dayIdx) => (
                                    <div key={`${h}-${dayIdx}`} className="relative h-6 border-t border-gray-100 dark:border-white/5">
                                        {mockTimesheet.filter((b) => b.day === dayIdx && Math.floor(b.startHour) === h).map((b, i) => {
                                            const frac = b.startHour - h;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`absolute left-0.5 right-0.5 rounded-[3px] px-1 text-[8px] font-semibold text-white shadow-sm ${categoryColors[b.category]}`}
                                                    style={{ top: `${frac * 100}%`, height: `${b.hours * 100}%` }}
                                                    title={`${b.category} · ${b.project}`}
                                                >
                                                    <span className="line-clamp-1">{b.category}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </Fragment>
                        ))}
                    </div>
                </Card>

                <div className="space-y-2">
                    <Card className="p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:text-white/70">Weekly total</p>
                        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{total.toFixed(1)}h</p>
                        <div className="mt-2"><ProgressBar value={(total / target) * 100} colorClass="bg-orange-500" /></div>
                        <p className="mt-1 text-[10px] text-gray-500 dark:text-white/60">{(target - total).toFixed(1)}h remaining to target</p>
                    </Card>
                    <Card className="p-3">
                        <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:text-white/70">By category</p>
                        <div className="space-y-1.5">
                            {Object.entries(totalByCat).map(([cat, h]) => (
                                <div key={cat} className="flex items-center gap-2">
                                    <span className={`h-2 w-2 flex-shrink-0 rounded-sm ${categoryColors[cat]}`} />
                                    <span className="flex-1 text-[10px] text-gray-700 dark:text-white/80">{cat}</span>
                                    <span className="text-[10px] font-semibold text-gray-900 dark:text-white">{h.toFixed(1)}h</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </TabShell>
    );
}
