'use client';

import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    BadgeDollarSign,
    Bot,
    CheckCircle2,
    Loader2,
    MessagesSquare,
    ShieldAlert,
    Sparkles,
} from "lucide-react";
import type { ProjectType, ScopeDemoResult } from "../landingAiMocks";
import { sampleMessages } from "../landingAiMocks";
import { tabMotion } from "./shared";

interface ScopeGuardTabProps {
    message: string;
    setMessage: (value: string) => void;
    rate: string;
    setRate: (value: string) => void;
    projectType: ProjectType;
    setProjectType: (value: ProjectType) => void;
    hasApprovedScope: boolean;
    setHasApprovedScope: (value: boolean | ((current: boolean) => boolean)) => void;
    status: "idle" | "loading" | "done";
    activeStep: number;
    result: ScopeDemoResult | null;
    showChangeOrder: boolean;
    highlighted: Array<{ text: string; highlighted: boolean }>;
    numericRate: number;
    analysisSteps: string[];
    ratePresets: number[];
    onLoadExample: () => void;
    onAnalyze: () => void;
    onGenerateChangeOrder: () => void;
    onDismissResult: () => void;
}

export function ScopeGuardTab({
    message,
    setMessage,
    rate,
    setRate,
    projectType,
    setProjectType,
    hasApprovedScope,
    setHasApprovedScope,
    status,
    activeStep,
    result,
    showChangeOrder,
    highlighted,
    numericRate,
    analysisSteps,
    ratePresets,
    onLoadExample,
    onAnalyze,
    onGenerateChangeOrder,
    onDismissResult,
}: ScopeGuardTabProps) {
    return (
        <motion.div
            {...tabMotion}
            className="relative flex h-full flex-col overflow-y-auto bg-slate-50/40 p-5 dark:bg-[#111111]"
        >
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">AI Scope Guard</h2>
                    <p className="mt-0.5 text-xs text-gray-700 dark:text-white/75">Monitoring 8 active projects</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Scanning
                </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
                {[
                    { label: "Revenue Saved", value: result ? `$${result.costHigh.toLocaleString()}` : "$4,260", change: result ? `${result.confidence}% confidence` : "3 flags" },
                    { label: "Scope Saved", value: result ? `${result.effortLow}-${result.effortHigh}h` : "8-12h", change: result ? "This request" : "avg hidden work" },
                    { label: "Risk Level", value: result ? result.riskLevel : "High", change: result ? result.suggestedAction : "Send change order" },
                ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-white/75">{item.label}</p>
                        <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                        <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400">{item.change}</p>
                    </div>
                ))}
            </div>

            <div className="grid flex-1 gap-4 xl:grid-cols-[1.04fr_0.96fr]">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <MessagesSquare className="h-4 w-4 text-orange-500" />
                            Paste a client message
                        </div>
                        <button type="button" onClick={onLoadExample} className="text-xs font-semibold text-orange-500 transition-colors hover:text-orange-400">
                            Use sample message
                        </button>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-[#161616]">
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder={`“${sampleMessages.hero}”`}
                            className="min-h-[178px] w-full resize-none bg-transparent text-[15px] leading-7 text-gray-900 placeholder:text-gray-600 focus:outline-none dark:text-white dark:placeholder:text-white/45"
                        />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-gray-700 dark:text-white/75">
                        Flow flags hidden scope, estimates effort, and suggests the next move.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <label className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-[#161616]">
                            <span className="app-label block text-gray-700 dark:text-white/75">Your rate</span>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 dark:text-white/75">$</span>
                                <input
                                    inputMode="numeric"
                                    value={rate}
                                    onChange={(event) => setRate(event.target.value.replace(/[^\d]/g, ""))}
                                    className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none dark:text-white"
                                />
                            </div>
                        </label>

                        <label className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-[#161616]">
                            <span className="app-label block text-gray-700 dark:text-white/75">Project type</span>
                            <select
                                value={projectType}
                                onChange={(event) => setProjectType(event.target.value as ProjectType)}
                                className="mt-2 w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none dark:text-white"
                            >
                                <option>Retainer</option>
                                <option>Fixed fee</option>
                                <option>Hourly</option>
                            </select>
                        </label>

                        <label className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-[#161616]">
                            <span className="app-label block text-gray-700 dark:text-white/75">Approved scope</span>
                            <button
                                type="button"
                                onClick={() => setHasApprovedScope((current) => !current)}
                                className={`mt-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                    hasApprovedScope
                                        ? "border-orange-500/30 bg-orange-500/[0.08] text-orange-800"
                                        : "border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/75"
                                }`}
                            >
                                <span>{hasApprovedScope ? "Yes, signed off" : "Not yet"}</span>
                                <span className={`h-2.5 w-2.5 rounded-full ${hasApprovedScope ? "bg-orange-500" : "bg-gray-300 dark:bg-white/20"}`} />
                            </button>
                        </label>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {ratePresets.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRate(String(value))}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    numericRate === value
                                        ? "border-orange-500/30 bg-orange-500/[0.08] text-orange-800"
                                        : "border-gray-200 bg-white text-gray-700 hover:text-gray-900 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/75 dark:hover:text-white"
                                }`}
                            >
                                ${value}/hr
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={onAnalyze}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                        >
                            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                            Analyze message
                        </button>
                        <div className="text-xs text-gray-700 dark:text-white/75">
                            Try it with a real client message. The demo never leaves this page.
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C]">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <div className="app-label text-gray-700 dark:text-white/75">Live analysis</div>
                            <p className="mt-1 text-sm text-gray-700 dark:text-white/75">
                                Flow shows its reasoning instead of hiding behind a spinner.
                            </p>
                        </div>
                        <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                status === "done"
                                    ? "border border-emerald-500/20 bg-emerald-500/[0.1] text-emerald-700"
                                    : "border border-gray-200 bg-slate-50 text-gray-700 dark:border-white/10 dark:bg-[#161616] dark:text-white/75"
                            }`}
                        >
                            <span className={`h-2 w-2 rounded-full ${status === "done" ? "bg-emerald-500" : "animate-pulse bg-orange-500"}`} />
                            {status === "done" ? "Analysis ready" : "Waiting for input"}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#161616]">
                        <div className="app-label mb-2 text-gray-700 dark:text-white/75">What Flow sees</div>
                        <div className="rounded-xl bg-white px-4 py-4 text-sm leading-7 text-gray-700 dark:bg-[#1C1C1C] dark:text-white/80">
                            {highlighted.map((chunk, index) => (
                                <span
                                    key={`${chunk.text}-${index}`}
                                    className={chunk.highlighted && status !== "idle" ? "rounded-md bg-orange-500/[0.14] px-1 py-0.5 text-gray-900 dark:text-white" : undefined}
                                >
                                    {chunk.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#161616]">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="app-label text-gray-700 dark:text-white/75">Analysis timeline</div>
                            {status === "loading" && <span className="text-xs text-orange-500">~2 seconds</span>}
                        </div>

                        <div className="space-y-3">
                            {analysisSteps.map((step, index) => {
                                const complete = activeStep >= index;
                                return (
                                    <div key={step} className="flex items-center gap-3">
                                        <div
                                            className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                                                complete
                                                    ? "border-orange-500/25 bg-orange-500/[0.12] text-orange-500"
                                                    : "border-gray-200 bg-white text-gray-300 dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/30"
                                            }`}
                                        >
                                            {complete ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm ${complete ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-white/75"}`}>{step}</div>
                                            <div className="mt-1 h-1.5 rounded-full bg-gray-200/80 dark:bg-white/[0.05]">
                                                <motion.div animate={{ width: complete ? "100%" : "0%" }} transition={{ duration: 0.35 }} className="h-full rounded-full bg-orange-500" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="mt-4 space-y-3">
                                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-rose-500">
                                                <AlertTriangle className="h-4 w-4" />
                                                {result.verdict}
                                            </div>
                                            <div className="mt-2 text-2xl font-black tracking-[-0.03em] text-gray-900 dark:text-white">
                                                {result.confidence}% confidence
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/65">{result.explanation}</p>
                                        </div>
                                        <div className="rounded-xl border border-rose-500/20 bg-white/80 px-3 py-2 text-right dark:bg-[#1C1C1C]/80">
                                            <div className="app-label text-gray-700 dark:text-white/75">Risk level</div>
                                            <div className="mt-1 text-sm font-semibold text-rose-500">{result.riskLevel}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161616]">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            <BadgeDollarSign className="h-4 w-4 text-orange-500" />
                                            Revenue impact
                                        </div>
                                        <div className="mt-3 text-xl font-black tracking-[-0.03em] text-gray-900 dark:text-white">
                                            ${result.costLow.toLocaleString()}-${result.costHigh.toLocaleString()}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-white/75">
                                            {result.effortLow}-{result.effortHigh} hours of likely unbilled work
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161616]">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            <Sparkles className="h-4 w-4 text-sky-500" />
                                            Best next move
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-white/70">{result.suggestedAction}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161616]">
                                    <div className="app-label text-gray-700 dark:text-white/75">Why Flow flagged it</div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {result.signals.map((signal) => (
                                            <span key={signal.label} className="rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-3 py-1.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
                                                {signal.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161616]">
                                    <div className="app-label text-gray-700 dark:text-white/75">Suggested reply</div>
                                    <div className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-gray-700 dark:bg-[#1A1A1A] dark:text-white/75">
                                        {result.response}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161616] sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Generate change order preview</div>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-white/75">Pre-filled line items and approval language based on this message.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onGenerateChangeOrder}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                                    >
                                        Generate change order
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl border border-dashed border-gray-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-[#161616]">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                                    Empty state
                                </div>
                                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-white/75">
                                    Paste a real client ask to see confidence, effort, cost impact, and the reply Flow would send next.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {result && !showChangeOrder && (
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.35 }}
                    className="absolute bottom-5 right-5 hidden w-72 rounded-xl border border-orange-100 bg-white p-4 shadow-[0_8px_32px_rgba(79,70,229,0.12)] lg:block dark:border-white/10 dark:bg-[#1C1C1C]"
                >
                    <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600">
                            <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Flow AI Assistant</span>
                        <span className="ml-auto text-[10px] text-gray-600 dark:text-white/75">ready</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-white/70">
                        I drafted a change order for this request with an estimated uplift of <b>+${result.costHigh.toLocaleString()}</b>. Want to review it?
                    </p>
                    <div className="mt-3.5 flex gap-2">
                        <button type="button" onClick={onGenerateChangeOrder} className="flex-1 rounded-lg bg-orange-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-700">
                            Review Draft
                        </button>
                        <button type="button" onClick={onDismissResult} className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white/80">
                            Dismiss
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
