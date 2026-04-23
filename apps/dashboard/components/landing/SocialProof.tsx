'use client';

import { motion } from "framer-motion";
import { Users, Clock, Zap } from "lucide-react";

const stats = [
    { icon: Users, value: "247", label: "agencies on the waitlist" },
    { icon: Clock, value: "< 2 min", label: "to set up your first project" },
    { icon: Zap, value: "40%", label: "of scope creep caught before it costs you" },
];

export function SocialProofSection() {
    return (
        <section id="social-proof" className="relative py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/60 uppercase tracking-widest mb-4">
                        <div className="w-4 h-px bg-foreground/20" />
                        Early access
                        <div className="w-4 h-px bg-foreground/20" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-6">
                        Agencies are joining fast.
                        <br />
                        <span className="text-orange-400">Spots are limited.</span>
                    </h2>

                    <p className="text-foreground/70 text-lg leading-relaxed">
                        Flow is in private beta. We&apos;re onboarding a small group of agencies and freelancers who are serious about protecting their margin.
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-4 md:grid-cols-3">
                    {stats.map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className="rounded-2xl border border-border bg-foreground/[0.03] p-8 text-center"
                        >
                            <item.icon className="w-6 h-6 text-orange-400 mx-auto mb-4" />
                            <div className="text-4xl font-black tracking-[-0.04em] text-foreground mb-2">
                                {item.value}
                            </div>
                            <p className="text-sm text-foreground/60">{item.label}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
