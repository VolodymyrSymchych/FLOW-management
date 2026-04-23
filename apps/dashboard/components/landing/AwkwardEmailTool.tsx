'use client';

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clipboard, Link2, MailPlus, MessageSquareQuote, Send, Share2 } from "lucide-react";
import { buildClientReply, sampleMessages, type EmailTone, type ProjectType } from "./landingAiMocks";

const tones: EmailTone[] = ["Diplomatic", "Firm", "Agency-polished", "Dead-simple"];

const scopePlaceholder =
    "Original project includes homepage redesign and 3 internal review rounds. No copywriting, presentation design, or live meeting support.";

function trackEvent(name: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;

    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
        gtag("event", name, payload);
    }
}

async function writeClipboard(value: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return false;

    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false;
    }
}

export function AwkwardEmailTool() {
    const [clientAsk, setClientAsk] = useState("");
    const [scopeContext, setScopeContext] = useState("");
    const [rate, setRate] = useState("150");
    const [tone, setTone] = useState<EmailTone>("Diplomatic");
    const [projectType, setProjectType] = useState<ProjectType>("Fixed fee");
    const [includePricing, setIncludePricing] = useState(true);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [activeVariant, setActiveVariant] = useState<EmailTone>("Diplomatic");
    const [copied, setCopied] = useState<null | "email" | "share">(null);

    const effectiveAsk = clientAsk || sampleMessages.awkward;
    const numericRate = Number.parseInt(rate, 10) || 150;

    const generated = useMemo(() => {
        const variants = tones.reduce<Record<EmailTone, ReturnType<typeof buildClientReply>>>((accumulator, currentTone) => {
            accumulator[currentTone] = buildClientReply({
                message: effectiveAsk,
                scopeContext: scopeContext || scopePlaceholder,
                rate: numericRate,
                tone: currentTone,
                includePricing,
                projectType,
            });

            return accumulator;
        }, {} as Record<EmailTone, ReturnType<typeof buildClientReply>>);

        return variants;
    }, [effectiveAsk, scopeContext, numericRate, includePricing, projectType]);

    const current = generated[activeVariant];
    const socialSnippet = `Client asked for “${effectiveAsk.slice(0, 88)}${effectiveAsk.length > 88 ? "…" : ""}”\n\nFlow verdict: ${current.diagnostics.analysis.verdict} (${current.diagnostics.analysis.confidence}% confidence)\nProtected: $${current.diagnostics.analysis.costLow.toLocaleString()}-$${current.diagnostics.analysis.costHigh.toLocaleString()}\n\nTry it on Flow.`;

    const handleGenerate = () => {
        setHasGenerated(true);
        setActiveVariant(tone);
        trackEvent("email_generator_started", {
            tone,
            include_pricing: includePricing,
            project_type: projectType,
        });
    };

    const handleUseExample = () => {
        setClientAsk(sampleMessages.awkward);
        setScopeContext(scopePlaceholder);
        trackEvent("email_generator_sample_loaded");
    };

    const handleCopy = async (kind: "email" | "share") => {
        const value = kind === "email" ? `${current.subject}\n\n${current.body}` : socialSnippet;
        const success = await writeClipboard(value);

        if (success) {
            setCopied(kind);
            window.setTimeout(() => setCopied(null), 1400);
            trackEvent(kind === "email" ? "email_generator_copied" : "email_generator_share_copied", {
                tone: activeVariant,
            });
        }
    };

    return (
        <section id="kill-feature" className="relative py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="mx-auto mb-14 max-w-3xl text-center"
                >
                    <h2 className="text-4xl font-black tracking-[-0.04em] text-foreground md:text-5xl">
                        Turn awkward client asks into
                        <br />
                        clean boundary-setting emails.
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-foreground/68">
                        Paste the request, pick your tone, get a send-ready reply that protects both the relationship and the revenue.
                    </p>
                    <p className="mt-3 text-sm font-semibold text-foreground/50">
                        Useful on its own. Indispensable when Flow catches these in real time.
                    </p>
                </motion.div>

                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                    <motion.form
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.45 }}
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleGenerate();
                        }}
                        aria-label="Draft a client reply"
                        className="rounded-[28px] border border-border bg-background/80 p-5 shadow-[0_20px_60px_rgba(15,15,14,0.06)]"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <div className="app-label text-foreground/45">Input</div>
                                <p className="mt-1 text-sm text-foreground/65">Useful on its own. Better when Flow catches these in real time.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleUseExample}
                                className="rounded-full text-xs font-semibold text-orange-500 transition-colors hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                Load realistic example
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="awkward-client-ask" className="mb-2 block text-sm font-semibold text-foreground">Paste the awkward ask</label>
                                <textarea
                                    id="awkward-client-ask"
                                    value={clientAsk}
                                    onChange={(event) => setClientAsk(event.target.value)}
                                    placeholder={sampleMessages.awkward}
                                    aria-describedby="awkward-client-ask-hint"
                                    className="min-h-[168px] w-full resize-none rounded-[22px] border border-border bg-foreground/[0.02] px-4 py-4 text-[15px] leading-7 text-foreground placeholder:text-foreground/30 transition-colors focus:border-orange-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                />
                                <span id="awkward-client-ask-hint" className="sr-only">The client message you want help replying to. Leaving this blank uses a realistic example.</span>
                            </div>

                            <div>
                                <label htmlFor="awkward-scope-context" className="mb-2 block text-sm font-semibold text-foreground">What was actually included?</label>
                                <textarea
                                    id="awkward-scope-context"
                                    value={scopeContext}
                                    onChange={(event) => setScopeContext(event.target.value)}
                                    placeholder={scopePlaceholder}
                                    aria-describedby="awkward-scope-context-hint"
                                    className="min-h-[124px] w-full resize-none rounded-[22px] border border-border bg-foreground/[0.02] px-4 py-4 text-sm leading-7 text-foreground placeholder:text-foreground/30 transition-colors focus:border-orange-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                />
                                <span id="awkward-scope-context-hint" className="sr-only">The scope you originally agreed on, so Flow can contrast the new request.</span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[22px] border border-border bg-foreground/[0.02] px-4 py-3 focus-within:border-orange-500/30 focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:ring-offset-2 focus-within:ring-offset-background">
                                    <label htmlFor="awkward-rate" className="app-label block text-foreground/45">Rate or minimum change order</label>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span aria-hidden="true" className="text-sm font-semibold text-foreground/55">$</span>
                                        <input
                                            id="awkward-rate"
                                            inputMode="numeric"
                                            aria-label="Rate or minimum change order in dollars"
                                            value={rate}
                                            onChange={(event) => setRate(event.target.value.replace(/[^\d]/g, ""))}
                                            className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <span className="mb-2 block text-sm font-semibold text-foreground">Pricing model</span>
                                    <div role="radiogroup" aria-label="Pricing model" className="flex flex-wrap gap-2">
                                        {(["Fixed fee", "Retainer", "Hourly"] as ProjectType[]).map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                role="radio"
                                                aria-checked={projectType === option}
                                                onClick={() => setProjectType(option)}
                                                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                    projectType === option
                                                        ? "border-orange-500/30 bg-orange-500/[0.08] text-orange-600"
                                                        : "border-border bg-background text-foreground/65 hover:text-foreground"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div role="radiogroup" aria-labelledby="awkward-tone-label">
                                <span id="awkward-tone-label" className="mb-2 block text-sm font-semibold text-foreground">Tone</span>
                                <div className="flex flex-wrap gap-2">
                                    {tones.map((toneOption) => (
                                        <button
                                            key={toneOption}
                                            type="button"
                                            role="radio"
                                            aria-checked={tone === toneOption}
                                            onClick={() => setTone(toneOption)}
                                            className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                tone === toneOption
                                                    ? "border-orange-500/30 bg-orange-500/[0.08] text-orange-600"
                                                    : "border-border bg-background text-foreground/65 hover:text-foreground"
                                            }`}
                                        >
                                            {toneOption}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={includePricing}
                                aria-label="Include pricing and change-order language in the draft"
                                onClick={() => setIncludePricing((value) => !value)}
                                className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                    includePricing
                                        ? "border-orange-500/25 bg-orange-500/[0.06] text-foreground"
                                        : "border-border bg-background text-foreground/60"
                                }`}
                            >
                                <span>Include pricing / change order language</span>
                                <span aria-hidden="true" className={`inline-flex h-6 w-11 items-center rounded-full p-1 ${includePricing ? "bg-orange-500/20" : "bg-foreground/[0.08]"}`}>
                                    <span
                                        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                            includePricing ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </span>
                            </button>

                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-foreground px-5 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <MailPlus aria-hidden="true" className="h-4 w-4" />
                                Draft my reply
                            </button>
                        </div>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.45, delay: 0.05 }}
                        className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--surface-elevated)),hsl(var(--surface)))] p-5 shadow-[0_20px_60px_rgba(15,15,14,0.06)]"
                    >
                        <AnimatePresence mode="wait">
                            {hasGenerated ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 12 }}
                                    className="space-y-4"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="app-label text-foreground/45">Output</div>
                                            <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-foreground">Send-ready boundary email</h3>
                                        </div>
                                        <div role="tablist" aria-label="Tone variants" className="flex flex-wrap gap-2">
                                            {tones.map((toneOption) => (
                                                <button
                                                    key={toneOption}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={activeVariant === toneOption}
                                                    aria-label={`Show ${toneOption} variant`}
                                                    onClick={() => setActiveVariant(toneOption)}
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                        activeVariant === toneOption
                                                            ? "border-orange-500/30 bg-orange-500/[0.08] text-orange-600"
                                                            : "border-border bg-background text-foreground/60 hover:text-foreground"
                                                    }`}
                                                >
                                                    {toneOption}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 xl:grid-cols-[1fr_0.42fr]">
                                        <div className="rounded-[24px] border border-border bg-background p-4">
                                            <div className="app-label text-foreground/45">Subject</div>
                                            <div className="mt-2 text-sm font-semibold text-foreground">{current.subject}</div>

                                            <div className="mt-4 whitespace-pre-line rounded-[20px] bg-foreground/[0.02] p-4 text-[15px] leading-7 text-foreground/78">
                                                {current.body}
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy("email")}
                                                    aria-label={copied === "email" ? "Email copied to clipboard" : "Copy email subject and body to clipboard"}
                                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-orange-500/25 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                >
                                                    {copied === "email" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Clipboard aria-hidden="true" className="h-4 w-4" />}
                                                    Copy email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveVariant("Firm")}
                                                    aria-label="Switch to the Firm tone variant"
                                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-orange-500/25 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                >
                                                    <Send aria-hidden="true" className="h-4 w-4" />
                                                    Make it firmer
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-[24px] border border-border bg-background p-4">
                                                <div className="app-label text-foreground/45">AI notes</div>
                                                <div className="mt-4 space-y-3">
                                                    <Metric label="Scope issue" value={current.diagnostics.scopeIssue} />
                                                    <Metric label="Boundary strength" value={current.diagnostics.boundaryStrength} />
                                                    <Metric label="Tone" value={current.diagnostics.toneLabel} />
                                                    <Metric label="Revenue protected" value={current.diagnostics.revenueProtected} />
                                                </div>
                                                <div className="mt-4 rounded-[18px] border border-orange-500/15 bg-orange-500/[0.06] p-3 text-sm leading-6 text-foreground/70">
                                                    Watchout: {current.diagnostics.watchout}
                                                </div>
                                            </div>

                                            <div className="rounded-[24px] border border-border bg-background p-4">
                                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                                    <Share2 className="h-4 w-4 text-sky-500" />
                                                    Shareable example
                                                </div>
                                                <div className="rounded-[20px] border border-sky-500/15 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(249,115,22,0.08))] p-4">
                                                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">
                                                        <MessageSquareQuote className="h-3.5 w-3.5" />
                                                        Flow verdict
                                                    </div>
                                                    <p className="text-sm leading-6 text-foreground/72">
                                                        “{effectiveAsk.slice(0, 120)}{effectiveAsk.length > 120 ? "…" : ""}”
                                                    </p>
                                                    <div className="mt-4 rounded-2xl bg-background/80 px-3 py-3">
                                                        <div className="text-lg font-black tracking-[-0.03em] text-foreground">
                                                            {current.diagnostics.analysis.verdict}
                                                        </div>
                                                        <div className="mt-1 text-sm text-foreground/60">
                                                            Protected: ${current.diagnostics.analysis.costLow.toLocaleString()}-${current.diagnostics.analysis.costHigh.toLocaleString()}
                                                        </div>
                                                        <div className="mt-3 text-sm font-semibold text-orange-600">
                                                            {current.body.split("\n").find((line) => line.trim().startsWith("If you want"))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy("share")}
                                                        aria-label={copied === "share" ? "Share text copied to clipboard" : "Copy shareable snippet to clipboard"}
                                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-sky-500/25 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                    >
                                                        {copied === "share" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Link2 aria-hidden="true" className="h-4 w-4" />}
                                                        Copy share copy
                                                    </button>
                                                </div>
                                                <span role="status" aria-live="polite" className="sr-only">
                                                    {copied === "email" ? "Email copied to clipboard." : copied === "share" ? "Share text copied to clipboard." : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex min-h-[540px] flex-col justify-between rounded-[24px] border border-dashed border-border bg-foreground/[0.02] p-5"
                                >
                                    <div>
                                        <div className="app-label text-foreground/45">Preview</div>
                                        <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-foreground">
                                            The tool writes the line you wish you had ready five minutes ago.
                                        </h3>
                                        <p className="mt-3 max-w-xl text-sm leading-7 text-foreground/65">
                                            You get the email draft, tone variants, diagnostics, and a clean share card worth sending to every agency Slack you’re in.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="rounded-[24px] border border-border bg-background p-4">
                                            <div className="app-label text-foreground/45">What appears after generation</div>
                                            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/70">
                                                <li>1. A send-ready reply tuned to the tone you picked.</li>
                                                <li>2. Flow’s opinionated read on whether the client is pushing past the agreed scope.</li>
                                                <li>3. A shareable result card with protected revenue baked in.</li>
                                            </ul>
                                        </div>

                                        <div className="rounded-[24px] border border-border bg-background p-4">
                                            <div className="app-label text-foreground/45">Why it gets bookmarked</div>
                                            <p className="mt-3 text-sm leading-7 text-foreground/70">
                                                It solves the hard part of client management: saying “yes, but paid” without sounding defensive.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[18px] border border-border bg-foreground/[0.02] px-3 py-3">
            <div className="app-label text-foreground/45">{label}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}
