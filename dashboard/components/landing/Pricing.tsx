'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: "Starter",
        price: "Free",
        description: "Perfect for freelancers and solo developers.",
        features: [
            "Up to 3 Projects",
            "Basic AI Analysis",
            "Kanban Board",
            "Community Support"
        ],
        cta: "Start for Free",
        popular: false
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For growing teams that need full control.",
        features: [
            "Unlimited Projects",
            "Advanced AI Risk Detection",
            "Gantt Charts & Timeline",
            "Smart Invoicing",
            "Priority Support"
        ],
        cta: "Get Started",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations requiring custom solutions.",
        features: [
            "Custom AI Models",
            "SLA & Dedicated Support",
            "SSO & Advanced Security",
            "On-premise Deployment",
            "API Access"
        ],
        cta: "Contact Sales",
        popular: false
    }
];

export function Pricing() {
    return (
        <section className="py-24 relative">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-text-secondary">
                        Choose the plan that fits your team's needs. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-2xl p-8 border ${plan.popular
                                    ? 'glass-heavy border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10'
                                    : 'glass-medium border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                                    {plan.period && <span className="text-text-secondary">{plan.period}</span>}
                                </div>
                                <p className="text-sm text-text-secondary">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-text-primary">
                                        <div className={`p-1 rounded-full ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-secondary'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/login"
                                className={`block w-full py-3 px-4 rounded-xl text-center font-semibold transition-all ${plan.popular
                                        ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/25'
                                        : 'glass-light text-text-primary hover:bg-white/10'
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
