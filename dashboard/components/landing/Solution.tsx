'use client';

import { motion } from "framer-motion";
import { Brain, FileText, PieChart, Layers, Check } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const features = [
    {
        icon: Brain,
        title: "AI Scope Analysis",
        slug: "ai-scope-analysis",
        description: "Automatically analyzes requirements against deliverables to detect scope creep before it impacts your budget.",
        color: "from-indigo-500 to-blue-500"
    },
    {
        icon: FileText,
        title: "Smart Invoicing",
        slug: "smart-invoicing",
        description: "Turn tracked time and approved milestones into professional invoices with one click.",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: PieChart,
        title: "Advanced Analytics",
        slug: "advanced-analytics",
        description: "Visualise team velocity, burn-down charts, and project health in real-time.",
        color: "from-emerald-500 to-teal-500"
    },
    {
        icon: Layers,
        title: "Unified Workspace",
        slug: "unified-workspace",
        description: "Kanban, Gantt charts, and Documentation all living together in one seamless interface.",
        color: "from-orange-500 to-red-500"
    }
];

export function SolutionSection() {
    const [hasScrolled, setHasScrolled] = useState(false);
    
    useEffect(() => {
        // Only enable animations after user interaction
        const handleScroll = () => {
            if (!hasScrolled) {
                setHasScrolled(true);
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasScrolled]);
    
    return (
        <section id="features" className="py-24 relative bg-gradient-to-b from-transparent via-black/10 to-black/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6">
                        Our Solution
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Everything You Need to Ship <br />
                        <span className="gradient-text">Without the Chaos</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <Link key={index} href={`/features/${feature.slug}`} className="block">
                            <motion.div
                                initial={hasScrolled ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                                animate={hasScrolled ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                                whileInView={hasScrolled ? { opacity: 1, scale: 1 } : {}}
                                whileHover={hasScrolled ? { scale: 1.02, y: -5 } : {}}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: hasScrolled ? index * 0.1 : 0, duration: hasScrolled ? 0.3 : 0, ease: "easeOut" }}
                                className="glass-card group relative h-full overflow-hidden rounded-3xl p-8 border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer"
                            >
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.color} opacity-[0.08] blur-[80px] group-hover:opacity-[0.15] transition-opacity duration-500`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-[1px] mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="w-full h-full rounded-2xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                        <feature.icon 
                                            className="w-7 h-7 text-white"
                                            style={{ 
                                                // Ensure consistent rendering
                                                opacity: 1,
                                                transform: 'translateZ(0)',
                                                backfaceVisibility: 'hidden'
                                            }}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    {feature.description}
                                </p>

                                <div className="flex items-center text-sm font-medium text-white/60 group-hover:text-white transition-colors w-fit">
                                    Learn more
                                    <Check className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
