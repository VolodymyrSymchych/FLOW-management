'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-white/10 mb-8"
                >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text-secondary">AI-Powered Project Management</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary mb-6"
                >
                    Master Your Scope <br />
                    <span className="text-primary">
                        With AI Precision
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-text-secondary max-w-2xl mx-auto mb-10"
                >
                    Stop scope creep before it starts. Analyze risks, track real-time velocity, and manage projects with the power of artificial intelligence.
                </motion.p>

                {/* Value Props / Use Cases Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-text-secondary"
                >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>For Agile Teams</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>Automated Risk Detection</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        <span>Real-Time Insights</span>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    <Link
                        href="/sign-in"
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl glass-button text-white font-semibold hover:scale-105 active:scale-95 transition-all"
                    >
                        Start Free Trial
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="px-8 py-4 rounded-xl glass-medium border border-white/10 text-text-primary font-semibold hover:bg-white/5 transition-all">
                        Watch Demo
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    className="mt-20 relative mx-auto max-w-5xl perspective-1000"
                >
                    <div className="relative rounded-xl border border-white/10 glass-heavy p-2 shadow-2xl shadow-primary/10 transform-gpu">
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
                        <div className="rounded-lg w-full h-[400px] bg-gradient-to-br from-surface-elevated/50 to-surface/50 flex items-center justify-center border border-white/5">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-text-secondary">Dashboard Preview</p>
                                <p className="text-text-tertiary text-sm mt-2">Coming Soon</p>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <motion.div
                            style={{ y: y1, opacity }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-8 top-10 p-4 rounded-xl glass-heavy border border-white/10 shadow-xl hidden md:block"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-secondary">Risk Analysis</div>
                                    <div className="text-sm font-bold text-text-primary">Low Risk</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            style={{ y: y2, opacity }}
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-8 bottom-20 p-4 rounded-xl glass-heavy border border-white/10 shadow-xl hidden md:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-secondary">Team Velocity</div>
                                    <div className="text-sm font-bold text-text-primary">+24% Increase</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
