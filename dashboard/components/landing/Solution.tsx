'use client';

import { motion } from "framer-motion";
import { Brain, FileText, PieChart, Layers, Shield, Zap } from "lucide-react";

const features = [
    {
        icon: Shield,
        title: "AI Scope Guard",
        description: "Automatically detect scope creep the moment it happens. Our AI compares chat messages, tasks, and requirements against your original SOW in real-time.",
        color: "from-orange-500 to-orange-500",
        glow: "bg-orange-500/20",
        large: true,
    },
    {
        icon: FileText,
        title: "Smart Invoicing",
        description: "Turn approved milestones and tracked time into professional invoices with one click.",
        color: "from-orange-500 to-orange-500",
        glow: "bg-orange-500/20",
        large: false,
    },
    {
        icon: PieChart,
        title: "Live Analytics",
        description: "Velocity, burn-down charts, and project health — always up to date.",
        color: "from-emerald-500 to-teal-500",
        glow: "bg-emerald-500/20",
        large: false,
    },
    {
        icon: Layers,
        title: "Unified Workspace",
        description: "Kanban, Gantt, and docs — all in one place. No more context switching.",
        color: "from-orange-500 to-amber-500",
        glow: "bg-orange-500/20",
        large: false,
    },
    {
        icon: Zap,
        title: "Automations",
        description: "Automate recurring reports, invoice reminders, and status updates.",
        color: "from-cyan-500 to-blue-500",
        glow: "bg-cyan-500/20",
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
            className={`group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300 ${feature.large ? 'md:col-span-2 md:row-span-1' : ''}`}
        >
            {/* Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 ${feature.glow} blur-[64px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-foreground/40 leading-relaxed">{feature.description}</p>
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
                        Everything you need.
                        <br />
                        <span className="text-foreground/30">Nothing you don't.</span>
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
