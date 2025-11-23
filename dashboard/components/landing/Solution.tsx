'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const benefits = [
    {
        title: "Eliminate Scope Creep",
        description: "AI-powered analysis compares initial requirements with current deliverables in real-time",
        impact: "Save 15-20% on project costs"
    },
    {
        title: "Accurate Time Estimates",
        description: "Machine learning models trained on thousands of projects predict realistic timelines",
        impact: "Reduce estimation errors by 60%"
    },
    {
        title: "Automatic Invoicing",
        description: "Track billable hours, generate invoices, and send them automatically when milestones complete",
        impact: "Get paid 40% faster"
    },
    {
        title: "Real-Time Risk Detection",
        description: "Identify potential delays, resource conflicts, and budget overruns before they become problems",
        impact: "Prevent 80% of project failures"
    },
    {
        title: "Team Velocity Tracking",
        description: "Understand your team's actual capacity and optimize resource allocation",
        impact: "Increase throughput by 30%"
    },
    {
        title: "Client Transparency",
        description: "Automated status updates and progress reports keep stakeholders informed without manual work",
        impact: "Save 10+ hours per week"
    }
];

export function Solution() {
    return (
        <section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-text-primary mb-6"
                    >
                        Meet Flow Management:{' '}
                        <span className="text-primary">
                            Your AI Project Partner
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-text-secondary"
                    >
                        We combine artificial intelligence with proven project management methodologies
                        to give you superhuman control over your projects.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-2xl glass-medium border border-white/10 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                                    {benefit.title}
                                </h3>
                            </div>
                            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                                {benefit.description}
                            </p>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-primary font-semibold text-sm">
                                    {benefit.impact}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass-button text-white font-semibold hover:scale-105 active:scale-95 transition-all group"
                    >
                        Start Your Free Trial
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-text-tertiary text-sm mt-4">
                        No credit card required • 14-day free trial • Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
