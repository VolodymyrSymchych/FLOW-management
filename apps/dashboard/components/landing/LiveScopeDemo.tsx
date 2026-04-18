'use client';

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    Bell,
    Calendar,
    CheckSquare,
    ChevronDown,
    Clock,
    FolderKanban,
    LayoutDashboard,
    Plug,
    Receipt,
    Shield,
    TrendingDown,
    Users,
} from "lucide-react";
import {
    analyzeScopeDemo,
    highlightMessage,
    mockChats,
    sampleMessages,
    type ProjectType,
    type ScopeDemoResult,
} from "./landingAiMocks";
import { AnalyticsTab } from "./mockup/AnalyticsTab";
import { BurndownTab } from "./mockup/BurndownTab";
import { CalendarTab } from "./mockup/CalendarTab";
import { DashboardTab } from "./mockup/DashboardTab";
import { InboxTab } from "./mockup/InboxTab";
import { IntegrationsTab } from "./mockup/IntegrationsTab";
import { InvoicesTab } from "./mockup/InvoicesTab";
import { ProjectsTab } from "./mockup/ProjectsTab";
import { ScopeGuardTab } from "./mockup/ScopeGuardTab";
import { TasksTab } from "./mockup/TasksTab";
import { TeamTab } from "./mockup/TeamTab";
import { TimesheetsTab } from "./mockup/TimesheetsTab";

type Tab =
    | "dashboard"
    | "tasks"
    | "inbox"
    | "calendar"
    | "scope-guard"
    | "projects"
    | "timesheets"
    | "invoices"
    | "burndown"
    | "analytics"
    | "integrations"
    | "team";

const analysisSteps = [
    "Parsing request",
    "Comparing against likely scope",
    "Estimating added work",
    "Drafting response",
];

const ratePresets = [120, 150, 180];
const inboxUnread = mockChats.reduce((sum, chat) => sum + chat.unread, 0);

const navSections = [
    {
        label: "Overview",
        items: [
            { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
            { id: "tasks" as Tab, label: "Tasks", icon: CheckSquare },
            { id: "inbox" as Tab, label: "Inbox", icon: Bell, badge: String(inboxUnread) },
            { id: "calendar" as Tab, label: "Calendar", icon: Calendar },
        ],
    },
    {
        label: "AI Tools",
        items: [
            { id: "scope-guard" as Tab, label: "Scope Guard", icon: Shield, badge: "LIVE", badgeStyle: "accent" },
        ],
    },
    {
        label: "Work",
        items: [
            { id: "projects" as Tab, label: "Projects", icon: FolderKanban },
            { id: "timesheets" as Tab, label: "Timesheets", icon: Clock },
            { id: "invoices" as Tab, label: "Invoices", icon: Receipt },
            { id: "burndown" as Tab, label: "Burndown", icon: TrendingDown },
            { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
            { id: "integrations" as Tab, label: "Integrations", icon: Plug },
            { id: "team" as Tab, label: "Team", icon: Users },
        ],
    },
];

function trackEvent(name: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;

    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
        gtag("event", name, payload);
    }
}

export function LiveScopeDemo() {
    const [activeTab, setActiveTab] = useState<Tab>("scope-guard");
    const [message, setMessage] = useState("");
    const [rate, setRate] = useState("120");
    const [projectType, setProjectType] = useState<ProjectType>("Fixed fee");
    const [hasApprovedScope, setHasApprovedScope] = useState(true);
    const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
    const [activeStep, setActiveStep] = useState(-1);
    const [result, setResult] = useState<ScopeDemoResult | null>(null);
    const [showChangeOrder, setShowChangeOrder] = useState(false);

    useEffect(() => {
        if (status !== "loading") return;

        const timers = analysisSteps.map((_, index) => window.setTimeout(() => setActiveStep(index), index * 340 + 120));
        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [status]);

    const highlighted = useMemo(
        () => highlightMessage(message || sampleMessages.hero, result?.signals ?? []),
        [message, result?.signals],
    );

    const numericRate = Number.parseInt(rate, 10) || 120;

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        trackEvent("landing_demo_tab_switched", { tab });
    };

    const handleLoadExample = () => {
        setMessage(sampleMessages.hero);
        setActiveTab("scope-guard");
        trackEvent("hero_demo_sample_loaded");
    };

    const handleAnalyze = () => {
        const input = (message || sampleMessages.hero).trim();
        const computed = analyzeScopeDemo({
            message: input,
            rate: numericRate,
            projectType,
            hasApprovedScope,
        });

        setActiveTab("scope-guard");
        setMessage(input);
        setResult(null);
        setStatus("loading");
        setActiveStep(-1);
        trackEvent("hero_demo_started", {
            message_length: input.length,
            project_type: projectType,
            approved_scope: hasApprovedScope,
        });

        window.setTimeout(() => {
            setResult(computed);
            setStatus("done");
            setActiveStep(analysisSteps.length - 1);
            trackEvent("hero_demo_completed", {
                verdict: computed.verdict,
                confidence: computed.confidence,
                cost_high: computed.costHigh,
            });
        }, 1800);
    };

    const handleGenerateChangeOrder = () => {
        setShowChangeOrder(true);
        trackEvent("hero_demo_change_order_clicked", {
            verdict: result?.verdict,
            cost_high: result?.costHigh,
        });
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case "dashboard":
                return <DashboardTab key="dashboard" />;
            case "tasks":
                return <TasksTab key="tasks" />;
            case "inbox":
                return <InboxTab key="inbox" />;
            case "calendar":
                return <CalendarTab key="calendar" />;
            case "scope-guard":
                return (
                    <ScopeGuardTab
                        key="scope-guard"
                        message={message}
                        setMessage={setMessage}
                        rate={rate}
                        setRate={setRate}
                        projectType={projectType}
                        setProjectType={setProjectType}
                        hasApprovedScope={hasApprovedScope}
                        setHasApprovedScope={setHasApprovedScope}
                        status={status}
                        activeStep={activeStep}
                        result={result}
                        showChangeOrder={showChangeOrder}
                        highlighted={highlighted}
                        numericRate={numericRate}
                        analysisSteps={analysisSteps}
                        ratePresets={ratePresets}
                        onLoadExample={handleLoadExample}
                        onAnalyze={handleAnalyze}
                        onGenerateChangeOrder={handleGenerateChangeOrder}
                        onDismissResult={() => setResult(null)}
                    />
                );
            case "projects":
                return <ProjectsTab key="projects" />;
            case "timesheets":
                return <TimesheetsTab key="timesheets" />;
            case "invoices":
                return <InvoicesTab key="invoices" />;
            case "burndown":
                return <BurndownTab key="burndown" />;
            case "analytics":
                return <AnalyticsTab key="analytics" />;
            case "integrations":
                return <IntegrationsTab key="integrations" />;
            case "team":
                return <TeamTab key="team" />;
            default:
                return null;
        }
    };

    return (
        <div
            aria-hidden="true"
            className="relative mx-auto w-full max-w-[1120px] overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_32px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)]"
        >
            <div className="h-10 select-none border-b border-gray-200 bg-gray-50 px-4 dark:border-white/10 dark:bg-[#1A1A1A]">
                <div className="flex h-full items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex flex-1 justify-center">
                        <div className="flex w-64 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-1 text-xs text-gray-600 shadow-sm dark:border-white/10 dark:bg-[#1C1C1C] dark:text-white/75">
                            flow.app/dashboard
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative flex h-[620px]">
                <div className="flex w-52 flex-col overflow-hidden border-r border-gray-100 bg-gray-50/60 dark:border-white/5 dark:bg-[#151515]">
                    <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3.5 dark:border-white/5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-600 text-xs font-black text-white">F</div>
                        <div>
                            <div className="text-xs font-bold leading-none text-gray-900 dark:text-white">Flow</div>
                            <div className="mt-0.5 text-[10px] leading-none text-gray-600 dark:text-white/75">My Workspace</div>
                        </div>
                        <ChevronDown className="ml-auto h-3 w-3 text-gray-600 dark:text-white/75" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-3">
                        {navSections.map((section) => (
                            <div key={section.label} className="mb-4">
                                <div className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-white/75">
                                    {section.label}
                                </div>
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.id === activeTab;

                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleTabChange(item.id)}
                                            className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                                isActive
                                                    ? "bg-gray-100 font-semibold text-gray-900 dark:bg-[#2A2A2A] dark:text-white"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-white/75 dark:hover:bg-[#2A2A2A]/50 dark:hover:text-white"
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {"badge" in item && item.badge && (
                                                <span
                                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                                        item.badgeStyle === "accent"
                                                            ? "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300"
                                                            : "bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white/85"
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 p-3 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-[10px] font-bold text-white">
                                JD
                            </div>
                            <div>
                                <div className="text-xs font-semibold leading-none text-gray-900 dark:text-white">John Doe</div>
                                <div className="mt-0.5 text-[10px] text-gray-600 dark:text-white/75">Pro Plan</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#1C1C1C]">
                    <AnimatePresence mode="wait">{renderActiveTab()}</AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {showChangeOrder && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            className="w-full max-w-2xl rounded-[28px] border border-border bg-background p-5 shadow-[0_28px_80px_rgba(15,15,14,0.16)]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="app-label text-foreground/45">Change order preview</div>
                                    <h4 className="mt-1 text-2xl font-black tracking-[-0.03em] text-foreground">Additional scope for approval</h4>
                                    <p className="mt-2 text-sm text-foreground/65">
                                        Flow turned the flagged request into priced line items and approval-ready language.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowChangeOrder(false)}
                                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/60 transition-colors hover:text-foreground"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="mt-5 rounded-[22px] border border-border bg-foreground/[0.02] p-4">
                                <div className="mb-3 grid grid-cols-[1fr_auto_auto] gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">
                                    <span>Line item</span>
                                    <span>Hours</span>
                                    <span>Amount</span>
                                </div>
                                <div className="space-y-3">
                                    {result.lineItems.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground/75">
                                            <span className="font-semibold text-foreground">{item.label}</span>
                                            <span>{item.hours}</span>
                                            <span className="font-semibold text-orange-600">{item.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 rounded-[22px] border border-orange-500/15 bg-orange-500/[0.06] p-4">
                                <div className="app-label text-foreground/45">Approval language</div>
                                <p className="mt-3 text-sm leading-7 text-foreground/72">
                                    This request adds work outside the current scope. If approved, Flow will attach these line items to a change order and begin once written approval is received.
                                </p>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-foreground/60">
                                    Total potential uplift: ${result.costLow.toLocaleString()}-${result.costHigh.toLocaleString()}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowChangeOrder(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                                >
                                    Looks good
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
