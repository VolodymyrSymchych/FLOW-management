import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "forever",
        description: "Perfect for freelancers and solo developers.",
        features: [
            "Up to 3 projects",
            "Basic AI analysis",
            "Kanban board",
            "Community support"
        ],
        cta: "Start for Free",
        popular: false
    },
    {
        name: "Pro",
        price: "$29",
        period: "per month",
        description: "For growing teams that need full visibility.",
        features: [
            "Unlimited projects",
            "Advanced AI risk detection",
            "Gantt charts & timeline",
            "Smart invoicing",
            "Priority support"
        ],
        cta: "Get Started",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "contact sales",
        description: "Advanced security and control for large orgs.",
        features: [
            "Custom AI models",
            "SLA & dedicated support",
            "SSO & advanced security",
            "On-premise deployment",
            "API access"
        ],
        cta: "Contact Sales",
        popular: false
    }
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 relative bg-gradient-to-b from-black/20 via-black/10 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-gray-400">
                        Choose the plan that fits your team size. Scale up or down at any time.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass-card relative rounded-3xl p-8 border ${plan.popular
                                    ? "border-indigo-500/50 bg-indigo-500/5"
                                    : "border-white/10"
                                } flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-indigo-500/20">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm text-gray-400">/{plan.period}</span>
                                </div>
                                <p className="text-gray-400 text-sm">{plan.description}</p>
                            </div>

                            <div className="flex-grow space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-indigo-400" />
                                        </div>
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`w-full py-3 rounded-xl font-medium transition-all ${plan.popular
                                        ? "glass-button text-white hover:shadow-lg hover:shadow-indigo-500/25"
                                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
