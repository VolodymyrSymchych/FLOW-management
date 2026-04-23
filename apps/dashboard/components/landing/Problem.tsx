'use client';

import { motion } from "framer-motion";

const before = [
    "Client asks for \"one small change\" — dev says sure",
    "Scope creep shows up on the final invoice — too late",
    "Your brief has gaps nobody caught until week three",
    "20+ hours a week on manual reports nobody reads",
];

const after = [
    "Brief gets a Scope Score before the contract is signed",
    "Change request flagged the moment it hits — priced, not ignored",
    "AI surfaces what's missing from the spec before work starts",
    "Reports go out automatically. Every Monday. Zero effort.",
];

export function ProblemSection() {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Subtle mid-page glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-widest mb-4">
                        <div className="w-4 h-px bg-rose-400" />
                        The Problem
                        <div className="w-4 h-px bg-rose-400" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight max-w-3xl mx-auto">
                        <span className="text-rose-400">$9,600 a year.</span>
                        <br />
                        Gone before you noticed.
                    </h2>
                    <p className="mt-4 text-rose-400/80 text-sm font-semibold tracking-wide">
                        10 unbilled hours/month × $80/hr × 12 months
                    </p>
                    <p className="mt-4 text-foreground/70 text-lg max-w-xl mx-auto">
                        Traditional project tools track what&apos;s done. Flow protects what&apos;s owed.
                    </p>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
                >
                    {[
                        { stat: "40%", label: "Projects hit scope creep" },
                        { stat: "25%", label: "Revenue unbilled on average" },
                        { stat: "20h+", label: "Weekly admin overhead" },
                        { stat: "60%", label: "Miss their deadline" },
                    ].map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-foreground/[0.02] border border-border rounded-2xl px-6 py-8 text-center backdrop-blur-md shadow-sm"
                        >
                            <div className="text-4xl md:text-5xl font-black text-rose-500 mb-2">{s.stat}</div>
                            <div className="text-sm text-foreground/70">{s.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Before / After */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-border bg-foreground/[0.02] p-8"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-sm font-bold text-foreground/70 uppercase tracking-widest">Without Flow</span>
                        </div>
                        <ul className="space-y-4">
                            {before.map((b) => (
                                <li key={b} className="flex items-start gap-3 text-sm text-foreground/70">
                                    <span className="mt-0.5 text-rose-500/80">✗</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-8"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                            <span className="text-sm font-bold text-orange-400 uppercase tracking-widest">With Flow</span>
                        </div>
                        <ul className="space-y-4">
                            {after.map((a) => (
                                <li key={a} className="flex items-start gap-3 text-sm text-foreground/90">
                                    <span className="mt-0.5 text-orange-400">✓</span>
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
