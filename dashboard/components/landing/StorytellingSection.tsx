'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface StorySection {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    imagePosition: 'left' | 'right';
    accentColor: string;
}

interface StorytellingProps {
    sections: StorySection[];
}

export function StorytellingSection({ sections }: StorytellingProps) {
    return (
        <div className="relative">
            {sections.map((section, index) => (
                <StorySection key={index} section={section} index={index} />
            ))}
        </div>
    );
}

function StorySection({ section, index }: { section: StorySection; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax effect for image
    const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
    const imageOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    // Text animations
    const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    const isImageLeft = section.imagePosition === 'left';

    return (
        <section
            ref={ref}
            className="relative flex items-center py-12 overflow-hidden"
        >
            {/* Background gradient blob */}
            <motion.div
                style={{ opacity: imageOpacity }}
                className={`absolute top-1/2 -translate-y-1/2 w-[600px] h-[600px] ${section.accentColor} opacity-10 blur-[120px] -z-10 ${isImageLeft ? 'left-0' : 'right-0'
                    }`}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isImageLeft ? '' : 'lg:grid-flow-dense'
                    }`}>
                    {/* Image Side */}
                    <motion.div
                        style={{
                            y: imageY,
                            scale: imageScale,
                            opacity: imageOpacity
                        }}
                        className={`relative ${isImageLeft ? 'lg:col-start-1' : 'lg:col-start-2'}`}
                    >
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                            {/* Glass overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10" />

                            {/* Border glow */}
                            <div className={`absolute inset-0 rounded-3xl ${section.accentColor} opacity-20 blur-xl`} />

                            {/* Image */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={section.imageSrc}
                                    alt={section.imageAlt}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </div>

                        {/* Decorative elements */}
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className={`absolute -top-6 ${isImageLeft ? '-right-6' : '-left-6'} w-24 h-24 ${section.accentColor} opacity-20 rounded-full blur-2xl`}
                        />
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        style={{
                            y: textY,
                            opacity: textOpacity
                        }}
                        className={`${isImageLeft ? 'lg:col-start-2' : 'lg:col-start-1'} space-y-6`}
                    >
                        {/* Section number */}
                        <motion.div
                            initial={{ opacity: 0, x: isImageLeft ? 20 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-flex items-center gap-3"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.accentColor} p-[1px]`}>
                                <div className="w-full h-full rounded-2xl bg-[#1a1612]/80 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-xl font-bold text-white/90">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/95 leading-tight"
                        >
                            {section.title}
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl"
                        >
                            {section.description}
                        </motion.p>

                        {/* Decorative line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className={`h-1 w-24 bg-gradient-to-r ${section.accentColor} rounded-full origin-left`}
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
