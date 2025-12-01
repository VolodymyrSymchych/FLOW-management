'use client';

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowLeft, Brain, FileText, PieChart, Layers } from "lucide-react";
import Link from "next/link";
import { StorytellingSection } from "@/components/landing/StorytellingSection";

const iconMap: Record<string, any> = {
    Brain,
    FileText,
    PieChart,
    Layers
};

// Map feature slugs to image paths
const featureImages: Record<string, string[]> = {
    "ai-scope-analysis": [
        "/images/features/ai-scope-1.png",
        "/images/features/ai-scope-2.png",
        "/images/features/ai-scope-3.png",
    ],
    "smart-invoicing": [
        "/images/features/invoicing-1.png",
        "/images/features/invoicing-2.png",
        "/images/features/invoicing-3.png",
    ],
    "advanced-analytics": [
        "/images/features/analytics-1.png",
        "/images/features/analytics-2.png",
        "/images/features/analytics-3.png",
    ],
    "unified-workspace": [
        "/images/features/workspace-1.png",
        "/images/features/workspace-2.png",
        "/images/features/workspace-3.png",
    ],
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
    slug?: string;
}

export function FeatureView({ feature, session, slug = "ai-scope-analysis" }: FeatureViewProps) {
    const Icon = iconMap[feature.icon] || Brain;

    // Get images for this feature
    const images = featureImages[slug] || featureImages["ai-scope-analysis"];

    // Create storytelling sections from feature data
    const storySections = [
        {
            title: feature.title,
            description: feature.description,
            imageSrc: images[0],
            imageAlt: `${feature.title} - Main Interface`,
            imagePosition: 'right' as const,
            accentColor: feature.color,
        },
        {
            title: "Key Capabilities",
            description: feature.details.join(". "),
            imageSrc: images[1],
            imageAlt: `${feature.title} - Capabilities`,
            imagePosition: 'left' as const,
            accentColor: feature.color,
        },
        {
            title: "Real Results",
            description: feature.benefits.join(". "),
            imageSrc: images[2],
            imageAlt: `${feature.title} - Benefits`,
            imagePosition: 'right' as const,
            accentColor: feature.color,
        },
    ];

    return (
        <div className="landing-theme min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Navbar user={session} />

            <main className="relative pt-24 pb-16 min-h-screen">
                {/* Background Gradient */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b ${feature.color} opacity-[0.08] blur-[150px]`} />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <Link href="/#features" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Features
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} p-[1px] mb-8 shadow-2xl`}>
                            <div className="w-full h-full rounded-3xl bg-[#1a1612]/90 backdrop-blur-sm flex items-center justify-center">
                                <Icon className="w-10 h-10 text-white/90" />
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white/95 mb-6 tracking-tight leading-tight">
                            {feature.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                </div>

                {/* Storytelling Sections */}
                <StorytellingSection sections={storySections} />

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16"
                >
                    <div className="max-w-4xl mx-auto text-center glass-card p-12 rounded-3xl border border-white/10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white/95 mb-6">
                            Ready to experience {feature.title}?
                        </h2>
                        <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
                            Join thousands of teams already using our platform to streamline their workflow.
                        </p>
                        <Link
                            href="/sign-up"
                            className={`inline-flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white font-semibold text-lg hover:scale-105 transition-transform duration-200 shadow-lg`}
                        >
                            Get Started Free
                        </Link>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
