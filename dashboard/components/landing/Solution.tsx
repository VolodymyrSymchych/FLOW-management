'use client';

import { motion } from "framer-motion";
import { FileText, PieChart, Layers, Shield, Zap } from "lucide-react";

const features = [
    {
        icon: Shield,
        title: "AI Scope Guard",
        description: "Flags new asks against the agreed brief the moment they show up, so margin loss gets caught before the work starts.",
        color: "from-orange-500 to-amber-400",
        glow: "bg-orange-500/20",
        large: true,
    },
    {
        icon: FileText,
        title: "Smart Invoicing",
        description: "Turns approved changes, milestones, and tracked time into invoice-ready records without leaking billable work.",
        color: "from-orange-500 to-orange-400",
        glow: "bg-orange-500/15",
        large: false,
    },
    {
        icon: PieChart,
        title: "Live Analytics",
        description: "Keeps delivery risk, scope pressure, and project health in view so teams can act before revenue slips.",
        color: "from-sky-500 to-cyan-400",
        glow: "bg-sky-500/15",
        large: false,
    },
    {
        icon: Layers,
        title: "Unified Workspace",
        description: "Keeps scope, tasks, docs, and client context in one record, so what was sold never gets separated from delivery.",
        color: "from-amber-500 to-orange-400",
        glow: "bg-amber-500/15",
        large: false,
    },
    {
        icon: Zap,
        title: "Automations",
        description: "Ships recurring reports, reminders, and follow-ups automatically, cutting admin hours without dropping important details.",
        color: "from-emerald-500 to-teal-400",
        glow: "bg-emerald-500/15",
        large: false,
    },
];

function FeatureCard({ feature, i }: { feature: typeof features[0]; i: number }) {
    const Icon = feature.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative rounded-2xl border border-border bg-foreground/[0.03] p-6 overflow-hidden hover:border-foreground/20 hover:bg-foreground/[0.05] transition-all duration-300 ${feature.large ? 'md:col-span-2 md:row-span-1' : ''}`}
        >
            {/* Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 ${feature.glow} blur-[64px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">{feature.description}</p>
        </motion.div>
    );
}

export function SolutionSection() {
    return (
        <section id="features" className="relative py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-widest mb-4">
                        <div className="w-4 h-px bg-orange-400" />
                        Features
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                        Every tool that protects your revenue.
                        <br />
                        <span className="text-foreground/50">So scope creep has nowhere to hide.</span>
                    </h2>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid md:grid-cols-3 auto-rows-auto gap-4">
                    {features.map((f, i) => <FeatureCard key={f.title} feature={f} i={i} />)}
                </div>
            </div>
        </section>
    );
}
