'use client';

import { useState } from "react";
import { List, LayoutGrid, Plus } from "lucide-react";
import { TabShell, TabHeader, StatusDot, PriorityBadge, Card, Avatar } from "./shared";
import { mockTasks, mockTeam, type MockTask } from "../landingAiMocks";

const buckets: MockTask['dueBucket'][] = ['Overdue', 'Today', 'This week', 'Upcoming', 'Done'];
const bucketTone: Record<MockTask['dueBucket'], string> = {
    'Overdue':   'text-rose-600 dark:text-rose-400',
    'Today':     'text-orange-600 dark:text-orange-400',
    'This week': 'text-sky-600 dark:text-sky-400',
    'Upcoming':  'text-gray-600 dark:text-white/60',
    'Done':      'text-emerald-600 dark:text-emerald-400',
};

export function TasksTab() {
    const [view, setView] = useState<'list' | 'board'>('list');

    return (
        <TabShell>
            <TabHeader
                title="My Tasks"
                subtitle={`${mockTasks.filter(t => t.status !== 'done').length} open · ${mockTasks.filter(t => t.dueBucket === 'Overdue').length} overdue`}
                right={
                    <>
                        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-white/10 dark:bg-[#1C1C1C]">
                            {(['list', 'board'] as const).map((v) => {
                                const Icon = v === 'list' ? List : LayoutGrid;
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setView(v)}
                                        className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold capitalize transition ${view === v ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 dark:text-white/70'}`}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {v}
                                    </button>
                                );
                            })}
                        </div>
                        <button className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-[10px] font-semibold text-white dark:bg-white dark:text-gray-900">
                            <Plus className="h-3 w-3" /> New task
                        </button>
                    </>
                }
            />

            {view === 'list' ? (
                <div className="space-y-3">
                    {buckets.map((bucket) => {
                        const items = mockTasks.filter((t) => t.dueBucket === bucket);
                        if (!items.length) return null;
                        return (
                            <div key={bucket}>
                                <div className={`mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${bucketTone[bucket]}`}>
                                    {bucket} <span className="text-gray-400 dark:text-white/40">· {items.length}</span>
                                </div>
                                <Card>
                                    {items.map((task, i) => {
                                        const assignee = mockTeam.find((t) => t.id === task.assignee);
                                        return (
                                            <div key={task.id} className={`flex items-center gap-2.5 px-3 py-2 ${i > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                                                <StatusDot status={task.status} />
                                                <span className={`flex-1 truncate text-[11px] font-medium ${task.status === 'done' ? 'text-gray-500 line-through dark:text-white/50' : 'text-gray-900 dark:text-white'}`}>
                                                    {task.title}
                                                </span>
                                                <span className="hidden truncate text-[10px] text-gray-500 dark:text-white/60 md:inline max-w-[140px]">{task.projectName}</span>
                                                <PriorityBadge priority={task.priority} />
                                                {assignee && <Avatar member={assignee} size={18} />}
                                                <span className="w-12 flex-shrink-0 text-right text-[10px] text-gray-500 dark:text-white/60">{task.due}</span>
                                            </div>
                                        );
                                    })}
                                </Card>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {(['todo', 'in-progress', 'done'] as const).map((col) => {
                        const items = mockTasks.filter((t) => t.status === col);
                        return (
                            <div key={col} className="rounded-xl bg-gray-100/70 p-2 dark:bg-white/5">
                                <div className="mb-2 flex items-center justify-between px-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-white/80">
                                        {col === 'todo' ? 'To Do' : col === 'in-progress' ? 'In Progress' : 'Done'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-white/50">{items.length}</span>
                                </div>
                                <div className="space-y-1.5">
                                    {items.slice(0, 4).map((task) => {
                                        const assignee = mockTeam.find((t) => t.id === task.assignee);
                                        return (
                                            <div key={task.id} className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
                                                <p className="mb-1.5 text-[11px] font-medium leading-snug text-gray-900 dark:text-white line-clamp-2">{task.title}</p>
                                                <div className="flex items-center justify-between">
                                                    <PriorityBadge priority={task.priority} />
                                                    {assignee && <Avatar member={assignee} size={16} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </TabShell>
    );
}
