'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CheckSquare,
    Shield,
    FolderKanban,
    Receipt,
    Clock,
    Bell,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Bot,
    Calendar,
    Users,
    ChevronDown,
    Circle,
    Plus,
    SquareKanban,
    LayoutList
} from 'lucide-react';

type Tab = string;

const fakeProjects = [
    { name: 'Client Portal Redesign', budget: '$12,000', health: 'Healthy', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Mobile API Migration', budget: '$8,500', health: 'At Risk', color: 'bg-amber-100 text-amber-700' },
];

const fakeTasks = [
    { title: 'Design new onboarding flow', assignee: 'SJ', priority: 'High', status: 'in-progress', id: 'FL-204' },
    { title: 'Fix memory leak in dashboard', assignee: 'MC', priority: 'Critical', status: 'todo', id: 'FL-203' },
    { title: 'Implement change order API', assignee: 'ER', priority: 'Medium', status: 'done', id: 'FL-201' },
    { title: 'Update billing portal logic', assignee: 'SJ', priority: 'Low', status: 'done', id: 'FL-199' },
];

const navSections = [
    {
        label: 'Overview',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
            { id: 'inbox', label: 'Inbox', icon: Bell, badge: '3' },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
        ]
    },
    {
        label: 'AI Tools',
        items: [
            { id: 'scope-guard', label: 'Scope Guard', icon: Shield, badge: 'NEW', badgeStyle: 'indigo' },
        ]
    },
    {
        label: 'Work',
        items: [
            { id: 'projects', label: 'Projects', icon: FolderKanban },
            { id: 'timesheets', label: 'Timesheets', icon: Clock },
            { id: 'invoices', label: 'Invoices', icon: Receipt },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'team', label: 'Team', icon: Users },
        ]
    },
];

function StatusDot({ status }: { status: string }) {
    if (status === 'in-progress') return <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin flex-shrink-0" />;
    if (status === 'done') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
    return <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />;
}

function PriorityBadge({ priority }: { priority: string }) {
    const map: Record<string, string> = {
        Critical: 'bg-red-50 text-red-600 border-red-100',
        High: 'bg-orange-50 text-orange-600 border-orange-100',
        Medium: 'bg-amber-50 text-amber-600 border-amber-100',
        Low: 'bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-white/60 border-gray-100 dark:border-white/5',
    };
    return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${map[priority] || map.Low}`}>{priority}</span>;
}

export function InteractiveMockup() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    return (
        <div
            role="img"
            aria-label="Flow dashboard preview: sidebar with Dashboard, My Tasks, Inbox, Calendar, and AI Scope Guard; main panel shows revenue, scope-saved, and on-time KPIs."
            aria-hidden="true"
            className="relative w-full max-w-6xl mx-auto rounded-2xl bg-background border border-border/80 shadow-[0_32px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Browser chrome */}
            <div className="h-10 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1A1A] flex items-center px-4 gap-3 select-none">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-1.5 px-4 py-1 rounded-md bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 text-xs text-gray-400 dark:text-white/50 shadow-sm w-64 justify-center">
                        flow.app/dashboard
                    </div>
                </div>
            </div>

            <div className="flex" style={{ height: '600px' }}>
                {/* Sidebar */}
                <div className="w-52 border-r border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-[#151515] flex flex-col overflow-hidden">
                    {/* Logo */}
                    <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-gray-100 dark:border-white/5">
                        <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center text-white font-black text-xs">F</div>
                        <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white leading-none">Flow</div>
                            <div className="text-[10px] text-gray-400 dark:text-white/50 leading-none mt-0.5">My Workspace</div>
                        </div>
                        <ChevronDown className="w-3 h-3 text-gray-400 dark:text-white/50 ml-auto" />
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                        {navSections.map((section) => (
                            <div key={section.label}>
                                <div className="px-2 mb-1 text-[9px] font-bold text-gray-400 dark:text-white/50 uppercase tracking-widest">{section.label}</div>
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.id === activeTab;
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => item.id && setActiveTab(item.id as Tab)}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all mb-0.5 ${
                                                isActive
                                                    ? 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-900 dark:text-white font-semibold'
                                                    : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2A2A2A]/50'
                                            } ${!item.id ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {item.badge && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                    item.badgeStyle === 'indigo'
                                                        ? 'bg-orange-100 text-orange-600'
                                                        : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-white/80'
                                                }`}>{item.badge}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* User */}
                    <div className="p-3 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">JD</div>
                            <div>
                                <div className="text-xs font-semibold text-gray-900 dark:text-white leading-none">John Doe</div>
                                <div className="text-[10px] text-gray-400 dark:text-white/50 mt-0.5">Pro Plan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-hidden relative bg-white dark:bg-[#1C1C1C]">
                    <AnimatePresence mode="wait">
                        {/* ─── SCOPE GUARD ─── */}
                        {activeTab === 'scope-guard' && (
                            <motion.div key="scope-guard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full flex flex-col p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">AI Scope Guard</h2>
                                        <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">Monitoring 8 active projects</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-lg shadow-sm text-xs font-medium text-emerald-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Scanning
                                    </div>
                                </div>

                                {/* Alerts */}
                                <div className="space-y-3 flex-1">
                                    <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-rose-200 p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 mt-0.5">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-rose-800">High Risk · Scope Creep Detected</span>
                                                    <span className="text-[10px] text-rose-400 flex-shrink-0">Just now</span>
                                                </div>
                                                <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                                                    Client requested <b>"multi-language support"</b> in task FL-204. Not included in the original SOW.
                                                </p>
                                                <div className="flex gap-2 mt-3">
                                                    <button className="text-[10px] font-semibold px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors">Flag for Change Order</button>
                                                    <button className="text-[10px] font-semibold px-2.5 py-1 bg-white dark:bg-[#1C1C1C] border border-rose-200 text-rose-600 rounded-md hover:bg-rose-50 transition-colors">Generate Invoice</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-amber-200 p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 mt-0.5">
                                                <BarChart3 className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-amber-800">Medium Risk · Velocity Drop</span>
                                                    <span className="text-[10px] text-amber-400 flex-shrink-0">2h ago</span>
                                                </div>
                                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                                    Team velocity dropped 15% this week. "Client Portal Redesign" is at risk of missing Milestone 2.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-bold text-gray-700 dark:text-white/80">All clear · Mobile API Migration</span>
                                                <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Project is on track. No scope issues detected in the last 7 days.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Popup */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.45, duration: 0.35 }}
                                    className="absolute bottom-5 right-5 w-72 bg-white dark:bg-[#1C1C1C] rounded-xl border border-orange-100 shadow-[0_8px_32px_rgba(79,70,229,0.12)] p-4"
                                >
                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-white/5">
                                        <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">Flow AI Assistant</span>
                                        <span className="ml-auto text-[10px] text-gray-400 dark:text-white/50">typing…</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed">
                                        I've drafted a change order email for the <b>multi-language</b> request. It includes the estimated cost impact (+$3,200). Want me to send it?
                                    </p>
                                    <div className="flex gap-2 mt-3.5">
                                        <button className="flex-1 text-xs font-semibold py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Review Draft</button>
                                        <button className="flex-1 text-xs font-semibold py-1.5 bg-gray-100 text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-200 transition-colors">Dismiss</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ─── DASHBOARD ─── */}
                        {activeTab === 'dashboard' && (
                            <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Overview</h2>
                                    <span className="text-xs text-gray-400 dark:text-white/50 px-2 py-1 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-lg">April 2026</span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-5">
                                    {[
                                        { label: 'Revenue', value: '$24,500', change: '↑ 12%', good: true },
                                        { label: 'Scope Saved', value: '$4,200', change: '3 flags', good: true },
                                        { label: 'On-Time', value: '94%', change: '8 projects', good: true },
                                    ].map((s) => (
                                        <div key={s.label} className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm">
                                            <p className="text-[10px] font-semibold text-gray-400 dark:text-white/50 uppercase tracking-wider">{s.label}</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
                                            <p className="text-[10px] text-emerald-600 font-medium mt-1">{s.change}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Projects */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-800 dark:text-white/90 mb-2">Active Projects</h3>
                                    <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                                        {fakeProjects.map((p, i) => (
                                            <div key={p.name} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#222222] dark:bg-[#1A1A1A] cursor-pointer transition-colors ${i > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                                                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <FolderKanban className="w-3.5 h-3.5 text-orange-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-white/50">Budget: {p.budget}</p>
                                                </div>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.health}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── MY TASKS ─── */}
                        {activeTab === 'tasks' && (
                            <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">My Tasks</h2>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/50">
                                        <span className="px-2 py-1 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-lg">In Progress</span>
                                        <span className="px-2 py-1 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-lg">Todo</span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                                    {fakeTasks.map((task, i) => (
                                        <div key={task.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#222222] dark:bg-[#1A1A1A] cursor-pointer transition-colors ${i > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}`}>
                                            <StatusDot status={task.status} />
                                            <span className={`flex-1 text-xs font-medium ${task.status === 'done' ? 'text-gray-400 dark:text-white/50 line-through' : 'text-gray-900 dark:text-white'} truncate`}>{task.title}</span>
                                            <PriorityBadge priority={task.priority} />
                                            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-[9px] font-bold flex-shrink-0">{task.assignee}</div>
                                            <span className="text-[10px] text-gray-400 dark:text-white/50 flex-shrink-0">{task.id}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    
                        
                        {/* ─── INBOX ─── */}
                        {activeTab === 'inbox' && (
                            <motion.div key="inbox" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Inbox (3)</h2>
                                <div className="space-y-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-3 rounded-xl flex gap-3 shadow-sm items-start">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">JD</div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">John Doe mentioned you</p>
                                                <p className="text-xs text-gray-500 dark:text-white/60 line-clamp-1">"Hey, can you check the new designs for the client portal?"</p>
                                                <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* ─── CALENDAR ─── */}
                        {activeTab === 'calendar' && (
                            <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">April 2026</h2>
                                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                    {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} className="text-[10px] font-bold text-gray-400">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {[...Array(30)].map((_, i) => (
                                        <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-xs ${i === 14 ? 'bg-orange-500 text-white font-bold shadow-md' : 'bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/80'}`}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ─── PROJECTS ─── */}
                        {activeTab === 'projects' && (
                            <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <div className="flex justify-between items-center mb-5">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">All Projects</h2>
                                    <button className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-lg">+ New</button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                                                <FolderKanban className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Project XYZ</h3>
                                            <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-orange-500 w-2/3 h-full rounded-full" />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2">66% Complete</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ─── TIMESHEETS ─── */}
                        {activeTab === 'timesheets' && (
                            <motion.div key="timesheets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">This Week: 32h 15m</h2>
                                <div className="space-y-2">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d, i) => (
                                        <div key={d} className="flex justify-between items-center bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-3 rounded-xl shadow-sm">
                                            <span className="text-xs font-medium text-gray-700 dark:text-white/80">{d}</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{(8 - i % 2)}h {(i * 15) % 60}m</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ─── INVOICES ─── */}
                        {activeTab === 'invoices' && (
                            <motion.div key="invoices" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Invoices</h2>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex justify-between items-center bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-3 rounded-xl shadow-sm">
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">INV-2026-00{i}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-white/60">Acme Corp</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">${3000 + i*500}.00</p>
                                                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-semibold text-center mt-1 inline-block">Paid</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ─── ANALYTICS ─── */}
                        {activeTab === 'analytics' && (
                            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Revenue Analytics</h2>
                                <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-xl p-4 shadow-sm h-64 flex items-end gap-2 justify-between">
                                    {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                                        <div key={i} className="w-full bg-orange-200 dark:bg-orange-900/30 rounded-t-sm relative group">
                                            <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-orange-500 rounded-t-sm" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 px-2 text-[10px] text-gray-400">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── TEAM ─── */}
                        {activeTab === 'team' && (
                            <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="h-full p-5 bg-slate-50/40 dark:bg-[#111111] overflow-y-auto">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Team Members</h2>
                                <div className="space-y-2 flex-1">
                                    {['Alice Smith', 'Bob Jones', 'Charlie Davis'].map((n, i) => (
                                        <div key={n} className="flex justify-between items-center bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-3 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{n[0]}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{n}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-white/60">{['Designer', 'Developer', 'Manager'][i]}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md">Edit</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

        
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
