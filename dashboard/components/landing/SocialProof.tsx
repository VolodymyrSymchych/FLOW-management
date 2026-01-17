'use client';

import { motion, useInView } from "framer-motion";
import { Star, TrendingUp, Shield, Users, DollarSign } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

const testimonials = [
    {
        quote: "We recovered $15k in unbilled scope changes in just the first month. This tool pays for itself 100x over.",
        author: "Sarah Jenkins",
        role: "CTO at TechFlow",
        avatar: "SJ",
        verified: true
    },
    {
        quote: "Finally, a way to explain to clients why 'just one small change' actually costs money. Game changer.",
        author: "Marcus Chen",
        role: "Freelance Developer",
        avatar: "MC",
        verified: true
    },
    {
        quote: "The AI detection is scary accurate. It flagged a risk in our specs that would have cost us weeks of delay.",
        author: "Elena Rodriguez",
        role: "Product Manager",
        avatar: "ER",
        verified: true
    }
];

const companies = ["Acme Corp", "GlobalTech", "Nebula", "FoxRun", "Circle", "Trio"];

const stats = [
    { icon: TrendingUp, value: 10000, label: "Projects Analyzed", suffix: "+" },
    { icon: Shield, value: 5000, label: "Scope Changes Detected", suffix: "+" },
    { icon: DollarSign, value: 2, label: "Money Saved", prefix: "$", suffix: "M+" },
    { icon: Users, value: 500, label: "Active Teams", suffix: "+" }
];

// Animated Counter Component
function AnimatedCounter({
    value,
    prefix = "",
    suffix = ""
}: {
    value: number;
    prefix?: string;
    suffix?: string;
}) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isInView, value]);

    return (
        <span ref={ref} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

const SocialProofSection = memo(function SocialProofSection() {
    return (
        <section className="py-24 bg-gradient-to-b from-transparent via-black/10 to-black/20 border-y border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Statistics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Trusted by Teams Worldwide</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="flex justify-center mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        <stat.icon className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <AnimatedCounter
                                    value={stat.value}
                                    prefix={stat.prefix}
                                    suffix={stat.suffix}
                                />
                                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Testimonials Section */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-12">Loved by Efficient Teams</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                className="glass-card p-8 rounded-2xl border border-white/10 text-left group hover:border-primary/30 transition-all"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4 text-yellow-500 fill-yellow-500"
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-300 mb-6 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                        {t.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium text-sm">{t.author}</p>
                                            {t.verified && (
                                                <div title="Verified user">
                                                    <Shield className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Company Logos */}
                <div className="pt-12 border-t border-white/5">
                    <p className="text-center text-gray-500 text-sm mb-8">TRUSTED BY INNOVATIVE TEAMS AT</p>
                    <div className="relative flex overflow-hidden mask-linear-fade group">
                        <div className="flex gap-16 animate-infinite-scroll whitespace-nowrap py-4 group-hover:[animation-play-state:paused]">
                            {companies.map((company, i) => (
                                <span key={i} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                                    {company}
                                </span>
                            ))}
                            {companies.map((company, i) => (
                                <span key={`dup-${i}`} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                                    {company}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-16 animate-infinite-scroll whitespace-nowrap py-4 group-hover:[animation-play-state:paused]" aria-hidden="true">
                            {companies.map((company, i) => (
                                <span key={i} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                                    {company}
                                </span>
                            ))}
                            {companies.map((company, i) => (
                                <span key={`dup-${i}`} className="text-xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export { SocialProofSection };
