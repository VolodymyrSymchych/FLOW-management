'use client';

import { Building2, UserPlus } from "lucide-react";
import { mockTeam } from "../landingAiMocks";
import { Avatar, Card, MiniStat, TabHeader, TabShell } from "./shared";

export function TeamTab() {
    const totalToday = mockTeam.reduce((sum, member) => sum + member.hoursToday, 0);
    const totalWeek = mockTeam.reduce((sum, member) => sum + member.hoursWeek, 0);

    return (
        <TabShell>
            <TabHeader
                title="Team"
                subtitle={`Studio Alpha · ${mockTeam.length} members`}
                right={
                    <>
                        <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/70">
                            <Building2 className="h-3 w-3" />
                            Studio Alpha
                        </div>
                        <button className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">
                            <UserPlus className="h-3 w-3" />
                            Invite
                        </button>
                    </>
                }
            />

            <div className="mb-4 grid grid-cols-3 gap-2.5">
                <MiniStat label="Total members" value={`${mockTeam.length}`} hint="in this workspace" />
                <MiniStat label="Hours today" value={`${totalToday.toFixed(1)}h`} hint="logged across the team" tone="positive" />
                <MiniStat label="This week" value={`${totalWeek.toFixed(1)}h`} hint="current attendance total" />
            </div>

            <div className="grid grid-cols-3 gap-3">
                {mockTeam.map((member) => (
                    <Card key={member.id} className="p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <Avatar member={member} size={34} />
                                <div className="min-w-0">
                                    <p className="truncate text-[12px] font-bold text-gray-900 dark:text-white">{member.name}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-white/60">{member.role}</p>
                                </div>
                            </div>
                            <button className="rounded-md border border-gray-200 px-1.5 py-1 text-[9px] text-gray-500 dark:border-white/10 dark:text-white/60">
                                View
                            </button>
                        </div>

                        <p className="truncate text-[10px] text-gray-600 dark:text-white/65">{member.email}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                                {member.hoursToday.toFixed(1)}h today
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-700 dark:bg-white/10 dark:text-white/70">
                                {member.hoursWeek.toFixed(1)}h this week
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        </TabShell>
    );
}
