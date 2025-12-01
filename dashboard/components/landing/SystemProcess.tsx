'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

export function SystemProcess() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Використовуємо єдиний прогрес скролу для всієї секції для ідеальної синхронізації
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 0.8", "end 0.8"] // Анімація починається коли верх секції на 80% екрану і закінчується коли низ на 80%
    });

    return (
        <div ref={containerRef} className="overflow-hidden py-24 lg:py-32 relative bg-gradient-to-b from-black/20 via-black/15 to-black/10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/3 to-transparent opacity-20"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none flex items-center justify-center">
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                            {/* PLAN - Top layer (-translate-y-12 = -48px) - з'являється першим */}
                            <AnimatedLayer
                                color="purple"
                                label="Plan"
                                zIndex={30}
                                translateY={-48}
                                scrollProgress={scrollYProgress}
                                scrollStart={0}
                                scrollEnd={0.25}
                                side="left"
                            />

                            {/* BUILD - Third layer (translate-y-0 = 0px) - з'являється другим */}
                            <AnimatedLayer
                                color="blue"
                                label="Build"
                                zIndex={20}
                                translateY={0}
                                scrollProgress={scrollYProgress}
                                scrollStart={0.25}
                                scrollEnd={0.5}
                                side="right"
                            />

                            {/* TRACK - Second layer (translate-y-12 = 48px) - з'являється третім */}
                            <AnimatedLayer
                                color="amber"
                                label="Track"
                                zIndex={10}
                                translateY={48}
                                scrollProgress={scrollYProgress}
                                scrollStart={0.5}
                                scrollEnd={0.75}
                                side="left"
                            />

                            {/* DEPLOY - Bottom layer (translate-y-24 = 96px) - з'являється останнім */}
                            <AnimatedLayer
                                color="emerald"
                                label="Deploy"
                                zIndex={0}
                                translateY={96}
                                scrollProgress={scrollYProgress}
                                scrollStart={0.75}
                                scrollEnd={1}
                                side="right"
                            />

                            <div className="absolute left-1/2 top-[-20%] bottom-[-20%] w-px border-l border-dashed border-white/15 -translate-x-1/2 z-[-1]"></div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6 w-fit">
                            Our Process
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                            From Idea to Impact
                            <br />
                            <span className="gradient-text">Without the Chaos</span>
                        </h2>

                        <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-lg">
                            Our streamlined workflow helps you ship faster, track progress effortlessly, and deliver projects that exceed expectations.
                        </p>

                        <div className="relative space-y-8">
                            <div className="bg-gradient-to-b from-indigo-500 via-purple-500/20 to-transparent w-[1px] absolute top-4 bottom-4 left-[19px]"></div>

                            <ProcessStep
                                icon="solar:clipboard-list-bold-duotone"
                                title="Plan Your Project"
                                description="Define requirements, break down tasks, and set clear milestones for your team."
                                color="indigo"
                                scrollProgress={scrollYProgress}
                                scrollStart={0}
                                scrollEnd={0.25}
                            />

                            <ProcessStep
                                icon="solar:code-square-bold-duotone"
                                title="Build with Confidence"
                                description="Execute tasks efficiently with real-time collaboration and version control."
                                color="purple"
                                scrollProgress={scrollYProgress}
                                scrollStart={0.25}
                                scrollEnd={0.5}
                            />

                            <ProcessStep
                                icon="solar:graph-new-bold-duotone"
                                title="Track Progress"
                                description="Monitor velocity, spot risks early, and keep stakeholders in the loop."
                                color="indigo"
                                scrollProgress={scrollYProgress}
                                scrollStart={0.5}
                                scrollEnd={0.75}
                            />

                            <ProcessStep
                                icon="solar:rocket-bold-duotone"
                                title="Deploy & Invoice"
                                description="Ship on time, generate invoices automatically, and celebrate success."
                                color="green"
                                scrollProgress={scrollYProgress}
                                scrollStart={0.75}
                                scrollEnd={1}
                            />
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">Integrations</p>
                            <div className="flex flex-wrap gap-8 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <iconify-icon icon="logos:github-icon" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:gitlab" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:slack-icon" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:jira" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:google-icon" width="26" className="hover:opacity-100 transition-opacity"></iconify-icon>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function AnimatedLayer({ color, label, zIndex, translateY, scrollProgress, scrollStart, scrollEnd, side }: {
    color: string;
    label: string;
    zIndex: number;
    translateY: number;  // в пікселях: -48, 0, 48, 96
    scrollProgress: any;
    scrollStart: number;
    scrollEnd: number;
    side: 'left' | 'right';
}) {
    const ref = useRef(null);

    // Анімація появи на основі скролу
    const opacity = useTransform(
        scrollProgress,
        [scrollStart, scrollEnd],
        [0, 1]
    );

    const scale = useTransform(
        scrollProgress,
        [scrollStart, scrollEnd],
        [0.8, 1]
    );

    // Анімація для тега
    const tagOpacity = useTransform(
        scrollProgress,
        [scrollStart + 0.1, scrollEnd],
        [0, 1]
    );

    const tagX = useTransform(
        scrollProgress,
        [scrollStart + 0.1, scrollEnd],
        [side === 'left' ? -30 : 30, 0]
    );

    const colorMap: any = {
        purple: { border: 'border-purple-500/20', bg: 'from-purple-500/15 to-purple-500/5', text: 'text-purple-300', dot: 'bg-purple-500', line: 'bg-purple-500/30', hoverBorder: 'group-hover:border-purple-500/30' },
        blue: { border: 'border-blue-500/20', bg: 'from-blue-500/15 to-blue-500/5', text: 'text-blue-300', dot: 'bg-blue-500', line: 'bg-blue-500/30', hoverBorder: 'group-hover:border-blue-500/30' },
        amber: { border: 'border-amber-500/20', bg: 'from-amber-500/15 to-amber-500/5', text: 'text-amber-300', dot: 'bg-amber-500', line: 'bg-amber-500/30', hoverBorder: 'group-hover:border-amber-500/30' },
        emerald: { border: 'border-emerald-500/20', bg: 'from-emerald-500/15 to-emerald-500/5', text: 'text-emerald-300', dot: 'bg-emerald-500', line: 'bg-emerald-500/30', hoverBorder: 'group-hover:border-emerald-500/30' },
    };

    const c = colorMap[color];

    return (
        <motion.div
            ref={ref}
            className="absolute inset-0 group"
            style={{
                zIndex,
                opacity,
                scale,
                y: translateY  // Позиція шару через style
            }}
            whileHover={{ y: translateY - 16 }}  // Hover ефект
            transition={{ duration: 0.3 }}
        >
            <div className={`w-full h-full border ${c.border} bg-gradient-to-br ${c.bg} backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-all duration-500 ${c.hoverBorder}`}></div>

            <motion.div
                className={`absolute top-1/2 ${side === 'left' ? '-left-16 sm:-left-28' : '-right-16 sm:-right-28'} translate-y-0 flex ${side === 'left' ? 'flex-row' : 'flex-row-reverse'} items-center gap-3`}
                style={{ opacity: tagOpacity, x: tagX }}
            >
                <div className={`px-3 py-1.5 rounded-full border ${c.border} bg-white/10 backdrop-blur-sm flex items-center gap-2 shadow-xl`}>
                    {side === 'left' && <span className={`text-sm font-medium ${c.text} uppercase tracking-wider`}>{label}</span>}
                    <div className={`w-2 h-2 ${c.dot} rounded-full`}></div>
                    {side === 'right' && <span className={`text-sm font-medium ${c.text} uppercase tracking-wider`}>{label}</span>}
                </div>
                <div className={`w-16 h-[1px] ${c.line}`}></div>
            </motion.div>
        </motion.div>
    );
}

function ProcessStep({ icon, title, description, color, scrollProgress, scrollStart, scrollEnd }: {
    icon: string;
    title: string;
    description: string;
    color: string;
    scrollProgress: any;
    scrollStart: number;
    scrollEnd: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-50px" });

    // Анімація появи на основі скролу
    const opacity = useTransform(
        scrollProgress,
        [scrollStart, scrollEnd],
        [0, 1]
    );

    const y = useTransform(
        scrollProgress,
        [scrollStart, scrollEnd],
        [30, 0]
    );

    const colorClasses: any = {
        indigo: {
            border: 'border-indigo-500/30',
            text: 'text-indigo-400',
            hoverBorder: 'group-hover:border-indigo-500',
            hoverText: 'group-hover:text-indigo-300',
            hoverShadow: 'group-hover:shadow-indigo-500/30',
            titleHover: 'group-hover:text-indigo-300'
        },
        purple: {
            border: 'border-purple-500/30',
            text: 'text-purple-400',
            hoverBorder: 'group-hover:border-purple-500',
            hoverText: 'group-hover:text-purple-300',
            hoverShadow: 'group-hover:shadow-purple-500/30',
            titleHover: 'group-hover:text-purple-300'
        },
        green: {
            border: 'border-green-500/30',
            text: 'text-green-400',
            hoverBorder: 'group-hover:border-green-500',
            hoverText: 'group-hover:text-green-300',
            hoverShadow: 'group-hover:shadow-green-500/30',
            titleHover: 'group-hover:text-green-300'
        },
    };

    const c = colorClasses[color] || colorClasses.indigo;

    return (
        <motion.div
            ref={ref}
            className="relative flex gap-6 group cursor-default"
            style={{ opacity, y }}
        >
            <div className="relative z-10 shrink-0">
                <div className={`w-10 h-10 rounded-full bg-black/50 border ${c.border} flex items-center justify-center ${c.text} ${c.hoverBorder} ${c.hoverText} ${c.hoverShadow} transition-all duration-300`}>
                    <iconify-icon icon={icon} width="20"></iconify-icon>
                </div>
            </div>
            <div className="pt-1">
                <h3 className={`text-lg text-white font-semibold mb-1.5 ${c.titleHover} transition-colors`}>{title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
