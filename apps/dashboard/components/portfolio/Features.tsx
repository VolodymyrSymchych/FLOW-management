"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FeatureProps {
    title: string;
    description: string;
    imageSrc: string;
    tags?: string[];
    align?: "left" | "right";
    index: number;
    slug: string;
}

const FeatureItem = ({ title, description, imageSrc, tags, align = "left", index, slug }: FeatureProps) => {
    const isLeft = align === "left";

    return (
        <div className={`flex flex-col ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-24 py-20 lg:py-32`}>
            {/* Image Side */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="w-full lg:w-1/2"
            >
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-y-2 bg-surface">
                        {/* Placeholder for actual image if not provided */}
                        <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                            {imageSrc ? (
                                <Image src={imageSrc} alt={title} fill className="object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
                                    <div className="w-20 h-20 rounded-xl bg-current opacity-20" />
                                    <span>Project Screenshot</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Side */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
                className="w-full lg:w-1/2 space-y-6"
            >
                <div className="flex flex-wrap gap-2">
                    {tags?.map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                            {tag}
                        </span>
                    ))}
                </div>

                <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
                    {title}
                </Typography>

                <Typography variant="p" className="text-lg text-muted-foreground leading-relaxed">
                    {description}
                </Typography>

                <ul className="space-y-3 pt-4">
                    {[1, 2, 3].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-muted-foreground">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                            <span>Key feature or benefit point {item}</span>
                        </li>
                    ))}
                </ul>

                <div className="pt-6">
                    <Link href={`/portfolio/${slug}`}>
                        <Button variant="ghost" className="group text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-0 hover:px-4 transition-all duration-300">
                            View Case Study <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export const Features = () => {
    const features = [
        {
            title: "E-Commerce Dashboard Redesign",
            slug: "ecommerce-dashboard",
            description: "A complete overhaul of the analytics dashboard for a major e-commerce platform. Focused on data visualization, accessibility, and real-time reporting capabilities.",
            imageSrc: "",
            tags: ["UX Research", "UI Design", "React"],
            align: "left" as const
        },
        {
            title: "Fintech Mobile App",
            slug: "fintech-mobile-app",
            description: "Secure and intuitive mobile banking application designed for the next generation of investors. Features biometric authentication and AI-driven financial insights.",
            imageSrc: "",
            tags: ["Mobile App", "Fintech", "Security"],
            align: "right" as const
        },
        {
            title: "Healthcare Patient Portal",
            slug: "healthcare-patient-portal",
            description: "Streamlining the patient experience with a unified portal for appointments, records, and telemedicine. Compliant with HIPAA regulations and built for accessibility.",
            imageSrc: "",
            tags: ["Healthcare", "Portal", "Accessibility"],
            align: "left" as const
        }
    ];

    return (
        <section className="container mx-auto px-4 py-20">
            {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} index={index} />
            ))}
        </section>
    );
};
