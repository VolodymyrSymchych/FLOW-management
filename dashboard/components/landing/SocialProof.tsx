'use client';

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        quote: "We recovered $15k in unbilled scope changes in just the first month. This tool pays for itself 100x over.",
        author: "Sarah Jenkins",
        role: "CTO at TechFlow",
        avatar: "SJ"
    },
    {
        quote: "Finally, a way to explain to clients why 'just one small change' actually costs money. Game changer.",
        author: "Marcus Chen",
        role: "Freelance Developer",
        avatar: "MC"
    },
    {
        quote: "The AI detection is scary accurate. It flagged a risk in our specs that would have cost us weeks of delay.",
        author: "Elena Rodriguez",
        role: "Product Manager",
        avatar: "ER"
    }
];

const companies = ["Acme Corp", "GlobalTech", "Nebula", "FoxRun", "Circle", "Trio"];

export function SocialProofSection() {
    return (
        <section className="py-24 bg-gradient-to-b from-transparent via-black/10 to-black/20 border-y border-white/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-12">Loved by Efficient Teams</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-8 rounded-2xl border border-white/10 text-left"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-gray-300 mb-6 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{t.author}</p>
                                        <p className="text-gray-500 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

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
}
