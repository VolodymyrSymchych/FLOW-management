'use client';

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import type { ReactNode } from "react";
import type { ProjectHealth, MockTeammate } from "../landingAiMocks";

export const tabMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.18 },
};

export function TabShell({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            {...tabMotion}
            className={`h-full overflow-y-auto bg-slate-50/40 p-5 dark:bg-[#111111] ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function TabHeader({
    title,
    subtitle,
    right,
}: {
    title: string;
    subtitle?: string;
    right?: ReactNode;
}) {
    return (
        <div className="mb-4 flex items-start justify-between gap-4">
            <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[11px] text-gray-700 dark:text-white/70">{subtitle}</p>}
            </div>
            {right && <div className="flex flex-shrink-0 items-center gap-2">{right}</div>}
        </div>
    );
}

export function MiniStat({
    label,
    value,
    hint,
    tone = "neutral",
}: {
    label: string;
    value: string;
    hint?: string;
    tone?: "positive" | "negative" | "neutral" | "warn";
}) {
    const toneClass: Record<string, string> = {
        positive: "text-emerald-600 dark:text-emerald-400",
        negative: "text-rose-600 dark:text-rose-400",
        warn: "text-amber-600 dark:text-amber-400",
        neutral: "text-gray-600 dark:text-white/70",
    };
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-600 dark:text-white/70">{label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            {hint && <p className={`mt-0.5 text-[10px] font-medium ${toneClass[tone]}`}>{hint}</p>}
        </div>
    );
}

export function ProgressBar({ value, colorClass = "bg-orange-500" }: { value: number; colorClass?: string }) {
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        </div>
    );
}

const healthMap: Record<ProjectHealth, { label: string; cls: string }> = {
    'Healthy':   { label: 'Healthy',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
    'On Track':  { label: 'On Track',  cls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
    'At Risk':   { label: 'At Risk',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
    'Delayed':   { label: 'Delayed',   cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
    'Completed': { label: 'Completed', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
};

export function RiskBadge({ health }: { health: ProjectHealth }) {
    const { label, cls } = healthMap[health];
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>;
}

export function StatusDot({ status }: { status: string }) {
    if (status === "in-progress")
        return <div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />;
    if (status === "done") return <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-emerald-500" />;
    if (status === "review") return <div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-violet-400" />;
    return <Circle className="h-3 w-3 flex-shrink-0 text-gray-300" />;
}

export function PriorityBadge({ priority }: { priority: string }) {
    const map: Record<string, string> = {
        Critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
        High: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
        Medium: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
        Low: "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70",
    };
    return <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${map[priority] || map.Low}`}>{priority}</span>;
}

export function Avatar({ member, size = 20 }: { member: Pick<MockTeammate, 'initials' | 'avatarBg'>; size?: number }) {
    return (
        <div
            className={`flex flex-shrink-0 items-center justify-center rounded-full text-white font-bold ${member.avatarBg}`}
            style={{ width: size, height: size, fontSize: Math.max(8, size * 0.45) }}
        >
            {member.initials}
        </div>
    );
}

export function AvatarStack({ members, size = 20 }: { members: MockTeammate[]; size?: number }) {
    return (
        <div className="flex -space-x-1.5">
            {members.map((m) => (
                <div
                    key={m.id}
                    className={`flex items-center justify-center rounded-full border-2 border-white text-white font-bold dark:border-[#1C1C1C] ${m.avatarBg}`}
                    style={{ width: size, height: size, fontSize: Math.max(8, size * 0.42) }}
                    title={m.name}
                >
                    {m.initials}
                </div>
            ))}
        </div>
    );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1C1C1C] ${className}`}>
            {children}
        </div>
    );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
    return (
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white/90">{children}</h3>
            {right}
        </div>
    );
}

export function Section({
    title,
    right,
    children,
    className = "",
}: {
    title: ReactNode;
    right?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <SectionTitle right={right}>{title}</SectionTitle>
            {children}
        </div>
    );
}
