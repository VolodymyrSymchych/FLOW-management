'use client';

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
    {
        quote: "We recovered $15k in unbilled scope changes in just the first month. This tool pays for itself 100x over.",
        author: "Sarah Jenkins",
        role: "CTO at TechFlow",
        avatar: "SJ",
    },
    {
        quote: "Finally, a way to explain to clients why 'just one small change' actually costs money. Game changer.",
        author: "Marcus Chen",
        role: "Freelance Developer",
        avatar: "MC",
    },
    {
        quote: "The AI detection is scary accurate. It flagged a risk in our specs that would have cost us weeks of delay.",
        author: "Elena Rodriguez",
        role: "Product Manager",
        avatar: "ER",
    },
];

const companies = ["Acme Corp", "GlobalTech", "Nebula", "FoxRun", "Circle", "Trio", "Vertex", "Pulsar"];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        const duration = 1800;
        const steps = 50;
        const inc = value / steps;
        let cur = 0;
        const t = setInterval(() => {
            cur += inc;
            if (cur >= value) { setCount(value); clearInterval(t); }
            else setCount(Math.floor(cur));
        }, duration / steps);
        return () => clearInterval(t);
    }, [inView, value]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function SocialProofSection() {
    return (
        <section className="relative py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 text-center"
                >
                    {[
                        { value: 10000, suffix: "+", label: "Projects Analyzed" },
                        { value: 5000, suffix: "+", label: "Scope Alerts Fired" },
                        { value: 2, suffix: "M+", label: "Revenue Protected ($)" },
                        { value: 500, suffix: "+", label: "Active Teams" },
                    ].map((s) => (
                        <div key={s.label}>
                            <div className="text-4xl md:text-5xl font-black text-foreground mb-1">
                                <Counter value={s.value} suffix={s.suffix} />
                            </div>
                            <div className="text-sm text-foreground/30">{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Testimonials */}
                <div className="mb-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="text-3xl md:text-4xl font-black text-foreground text-center mb-12"
                    >
                        Loved by efficient teams.
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 hover:border-white/[0.14] transition-colors"
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-foreground/60 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xs font-bold text-foreground">{t.avatar}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{t.author}</p>
                                        <p className="text-xs text-foreground/30">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Logo marquee */}
                <div className="mt-20 pt-12 border-t border-foreground/[0.06] overflow-hidden">
                    <p className="text-center text-xs font-semibold text-foreground/40 dark:text-white/30 uppercase tracking-widest mb-8">Trusted by teams at</p>
                    
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes custom-marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-marquee-custom {
                            animation: custom-marquee 30s linear infinite;
                            flex-wrap: nowrap;
                            display: flex;
                            width: max-content;
                        }
                        .animate-marquee-custom:hover {
                            animation-play-state: paused;
                        }
                    `}} />
                    
                    <div className="relative flex overflow-hidden mask-linear-fade">
                        <div className="animate-marquee-custom py-2">
                            {/* Duplicate exactly TWO times so that translating -50% perfectly loops back to 0 */}
                            {[...companies, ...companies].map((c, i) => (
                                <span key={i} className="text-base font-bold text-foreground/40 dark:text-white/40 hover:text-foreground/70 dark:hover:text-white/70 transition-colors cursor-default mx-8">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
