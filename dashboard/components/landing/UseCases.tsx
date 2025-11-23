'use client';

import { motion } from 'framer-motion';
import { Code2, Briefcase, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const useCases = [
    {
        title: "For Freelancers",
        description: "Stop undercharging. Track every hour, automate invoices, and show clients exactly what they're paying for.",
        icon: Code2,
        features: ["Time Tracking", "Automated Invoices", "Client Portal"],
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "For Agencies",
        description: "Manage multiple projects without the chaos. Keep stakeholders aligned and margins healthy with AI insights.",
        icon: Briefcase,
        features: ["Resource Management", "Profitability Tracking", "White-label Reports"],
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        title: "For Enterprise",
        description: "Scale with confidence. Get deep visibility into cross-functional teams and predict delivery risks before they happen.",
        icon: Building2,
        features: ["SSO & Security", "Custom AI Models", "API Access"],
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20"
    }
];

export function UseCases() {
    return (
        <section className="py-24 relative">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Built for every stage of growth
                    </h2>
                    <p className="text-text-secondary">
                        Whether you're a solo developer or a global enterprise, we have the tools you need.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={useCase.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`group relative p-8 rounded-2xl glass-medium border hover:bg-white/5 transition-all ${useCase.border}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${useCase.bg} ${useCase.color}`}>
                                <useCase.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-text-primary mb-3">{useCase.title}</h3>
                            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                                {useCase.description}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {useCase.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-text-primary/80">
                                        <div className={`w-1.5 h-1.5 rounded-full ${useCase.color.replace('text-', 'bg-')}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors group-hover:translate-x-1 duration-300"
                            >
                                Learn more <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
