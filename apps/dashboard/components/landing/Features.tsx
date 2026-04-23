'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

const features = [
    {
        index: '01',
        title: 'AI Scope Guard',
        description: 'Flags new asks against the agreed brief the moment they arrive. So margin loss gets caught before the work starts — not after.',
        accent: 'text-orange-400',
        featured: true,
        preview: (
            <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-4">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400/70">Scope analysis · live</div>
                <div className="space-y-2">
                    {[
                        { label: 'Figma revisions', status: 'IN SCOPE', ok: true },
                        { label: 'Presentation deck', status: 'OUT OF SCOPE', ok: false },
                        { label: 'Live meeting support', status: 'OUT OF SCOPE', ok: false },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2.5">
                            <span className="text-xs font-medium text-foreground/80">{row.label}</span>
                            <span className={`text-[10px] font-bold tracking-wide ${row.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {row.status}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2.5 text-xs leading-5 text-orange-300">
                    2 out-of-scope requests detected. Draft reply ready.
                </div>
            </div>
        ),
    },
    {
        index: '02',
        title: 'Smart Invoicing',
        description: 'Turns approved changes, milestones, and tracked hours into invoice-ready records. Nothing billable slips through.',
        accent: 'text-emerald-400',
        featured: false,
    },
    {
        index: '03',
        title: 'Live Analytics',
        description: 'Delivery risk, scope pressure, and project health — visible in real time. Act before revenue slips, not after the deadline.',
        accent: 'text-sky-400',
        featured: false,
    },
    {
        index: '04',
        title: 'Unified Workspace',
        description: 'Scope docs, tasks, client context, and team communication — all in one place. What was sold stays connected to what\'s delivered.',
        accent: 'text-violet-400',
        featured: false,
    },
    {
        index: '05',
        title: 'Automations',
        description: 'Status reports, reminders, and client follow-ups go out automatically. Cut 20+ hours of admin without dropping anything important.',
        accent: 'text-amber-400',
        featured: false,
    },
];

const Features = memo(function Features() {
    const featured = features[0];
    const rest = features.slice(1);

    return (
        <section id="features" className="relative py-32 overflow-hidden">
            <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/4 rounded-full bg-orange-900/10 blur-[140px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/60 uppercase tracking-widest mb-6">
                        <div className="w-4 h-px bg-foreground/20" />
                        Features
                        <div className="w-4 h-px bg-foreground/20" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight max-w-2xl">
                        Every tool that protects your revenue.
                        <br />
                        <span className="text-orange-400">So scope creep has nowhere to hide.</span>
                    </h2>
                </motion.div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-[1fr_1fr] gap-4">

                    {/* Featured card — AI Scope Guard */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="lg:row-span-2 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] to-transparent p-8 flex flex-col"
                    >
                        <div className="text-[80px] font-black leading-none tracking-[-0.06em] text-orange-400/20 select-none mb-4">
                            {featured.index}
                        </div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                            {featured.title}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-foreground/65 max-w-sm">
                            {featured.description}
                        </p>
                        {featured.preview}
                    </motion.div>

                    {/* Right column — 2 top cards */}
                    {rest.slice(0, 2).map((feature, i) => (
                        <motion.div
                            key={feature.index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.08 + i * 0.06 }}
                            className="rounded-3xl border border-border bg-foreground/[0.02] p-7 flex flex-col justify-between group hover:border-foreground/15 transition-colors"
                        >
                            <div>
                                <div className={`text-[52px] font-black leading-none tracking-[-0.05em] mb-4 opacity-20 select-none ${feature.accent}`}>
                                    {feature.index}
                                </div>
                                <h3 className="text-lg font-black text-foreground tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-foreground/60">
                                    {feature.description}
                                </p>
                            </div>
                            <div className={`mt-6 h-px w-8 ${feature.accent.replace('text-', 'bg-')} opacity-40 group-hover:w-16 group-hover:opacity-70 transition-all duration-300`} />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom row — 3 smaller cards */}
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                    {rest.slice(2).map((feature, i) => (
                        <motion.div
                            key={feature.index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.18 + i * 0.06 }}
                            className="rounded-3xl border border-border bg-foreground/[0.02] p-7 group hover:border-foreground/15 transition-colors"
                        >
                            <div className={`text-[40px] font-black leading-none tracking-[-0.05em] mb-4 opacity-20 select-none ${feature.accent}`}>
                                {feature.index}
                            </div>
                            <h3 className="text-base font-black text-foreground tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-foreground/60">
                                {feature.description}
                            </p>
                            <div className={`mt-5 h-px w-6 ${feature.accent.replace('text-', 'bg-')} opacity-40 group-hover:w-12 group-hover:opacity-70 transition-all duration-300`} />
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
});

export { Features };
