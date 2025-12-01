'use client';

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowLeft, Check, Brain, FileText, PieChart, Layers } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, any> = {
    Brain,
    FileText,
    PieChart,
    Layers
};

interface FeatureViewProps {
    feature: {
        title: string;
        description: string;
        icon: string;
        details: string[];
        benefits: string[];
        color: string;
    };
    session: any;
}

export function FeatureView({ feature, session }: FeatureViewProps) {
    const Icon = iconMap[feature.icon] || Brain;

    return (
        <div className="landing-theme min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
            <Navbar user={session} />

            <main className="relative pt-24 pb-16 min-h-screen">
                {/* Background Gradient Blob */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b ${feature.color} opacity-[0.15] blur-[120px] -z-10`} />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/#features" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-12 transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Features
                    </Link>

                    <div className="max-w-5xl mx-auto">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-20"
                        >
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${feature.color} p-[1px] mb-8 shadow-2xl shadow-indigo-500/10`}>
                                <div className="w-full h-full rounded-3xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                    <Icon className="w-12 h-12 text-white" />
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                                {feature.title}
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>

                        {/* Content Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Key Capabilities */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="glass-card p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                                    <span className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mr-4 border border-indigo-500/20">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    </span>
                                    Key Capabilities
                                </h2>
                                <ul className="space-y-4">
                                    {feature.details.map((detail: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3 group">
                                            <div className={`mt-1.5 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            </div>
                                            <span className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Benefits */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="glass-card p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                                    <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-4 border border-emerald-500/20">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </span>
                                    Benefits
                                </h2>
                                <ul className="space-y-4">
                                    {feature.benefits.map((benefit: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3 group">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
