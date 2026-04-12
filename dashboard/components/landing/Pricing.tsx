'use client';

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "forever",
        description: "Perfect for freelancers and solo developers.",
        features: ["Up to 3 projects", "Basic AI analysis", "Kanban board", "Community support"],
        cta: "Start for free",
        href: "/sign-up",
        popular: false,
    },
    {
        name: "Pro",
        price: "$29",
        period: "per month",
        description: "For growing teams that need full visibility.",
        features: ["Unlimited projects", "Advanced AI risk detection", "Gantt & timeline", "Smart invoicing", "Priority support"],
        cta: "Get started",
        href: "/sign-up",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "contact us",
        description: "Advanced security and control for large orgs.",
        features: ["Custom AI models", "SLA & dedicated support", "SSO & security", "On-premise option", "API access"],
        cta: "Contact sales",
        href: "/sign-up",
        popular: false,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="relative py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/30 uppercase tracking-widest mb-4">
                        <div className="w-4 h-px bg-white/20" />
                        Pricing
                        <div className="w-4 h-px bg-white/20" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Simple, transparent pricing.</h2>
                    <p className="mt-4 text-foreground/40 text-lg">Scale up or down any time. No hidden fees.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.45 }}
                            className={`relative flex flex-col rounded-2xl p-6 ${
                                plan.popular
                                    ? 'border border-orange-500/40 bg-orange-500/[0.06]'
                                    : 'border border-white/[0.07] bg-white/[0.02]'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600 text-xs font-bold text-foreground">
                                    <Zap className="w-3 h-3" />
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-4">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-black text-foreground">{plan.price}</span>
                                    <span className="text-sm text-foreground/30">/{plan.period}</span>
                                </div>
                                <p className="text-sm text-foreground/30">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/50">
                                        <Check className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all ${
                                    plan.popular
                                        ? 'bg-foreground text-background hover:bg-foreground/90'
                                        : 'bg-white/[0.06] text-foreground hover:bg-foreground/10 border border-white/[0.08]'
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
