'use client';

import { useState } from "react";
import { Search, Send } from "lucide-react";
import { TabShell, Avatar } from "./shared";
import { mockChats } from "../landingAiMocks";

export function InboxTab() {
    const [activeId, setActiveId] = useState(mockChats[0].id);
    const active = mockChats.find((c) => c.id === activeId) ?? mockChats[0];
    const totalUnread = mockChats.reduce((n, c) => n + c.unread, 0);

    return (
        <TabShell className="!p-0">
            <div className="flex h-full">
                {/* Sidebar list */}
                <div className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-white/10 dark:bg-[#1C1C1C]">
                    <div className="border-b border-gray-100 p-3 dark:border-white/5">
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Inbox</h2>
                            <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{totalUnread}</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                            <input
                                className="w-full rounded-md border border-gray-200 bg-gray-50 pl-6 pr-2 py-1 text-[10px] text-gray-700 placeholder:text-gray-400 dark:border-white/10 dark:bg-[#141414] dark:text-white/80"
                                placeholder="Search chats…"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {mockChats.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setActiveId(c.id)}
                                className={`flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2.5 text-left transition dark:border-white/5 ${
                                    c.id === activeId ? 'bg-orange-50 dark:bg-orange-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <Avatar member={{ initials: c.avatarInitials, avatarBg: c.avatarBg }} size={28} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="truncate text-[11px] font-semibold text-gray-900 dark:text-white">{c.name}</span>
                                        <span className="flex-shrink-0 text-[9px] text-gray-500 dark:text-white/50">{c.time}</span>
                                    </div>
                                    <p className="line-clamp-1 text-[10px] text-gray-600 dark:text-white/60">{c.last}</p>
                                </div>
                                {c.unread > 0 && <span className="mt-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">{c.unread}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Thread */}
                <div className="flex flex-1 flex-col bg-slate-50/40 dark:bg-[#111111]">
                    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-[#1C1C1C]">
                        <Avatar member={{ initials: active.avatarInitials, avatarBg: active.avatarBg }} size={26} />
                        <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{active.name}</p>
                            <p className="text-[10px] text-emerald-600">● Active now</p>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-4">
                        {active.messages.map((m, i) => (
                            <div key={i} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug shadow-sm ${
                                    m.isMe
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white text-gray-800 dark:bg-[#1C1C1C] dark:text-white/90'
                                }`}>
                                    {!m.isMe && <p className="mb-0.5 text-[9px] font-bold text-gray-500 dark:text-white/50">{m.from}</p>}
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1C]">
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 dark:border-white/10 dark:bg-[#141414]">
                            <input className="flex-1 bg-transparent text-[11px] text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-white/80" placeholder="Write a reply…" readOnly />
                            <button className="rounded-md bg-orange-500 p-1 text-white"><Send className="h-3 w-3" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </TabShell>
    );
}
