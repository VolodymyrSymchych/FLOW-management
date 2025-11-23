'use client';

import { motion } from 'framer-motion';
import { Target, TrendingDown, DollarSign, Clock } from 'lucide-react';

const problems = [
    {
        icon: Target,
        title: "Scope Creep",
        description: "40% of projects exceed original scope without billing",
        stat: "40%",
        color: "text-red-400",
        bg: "bg-red-500/10"
    },
    {
        icon: TrendingDown,
        title: "Poor Estimates",
        description: "Estimates off by 30-50% leading to missed deadlines",
        stat: "30-50%",
        color: "text-orange-400",
        bg: "bg-orange-500/10"
    },
    {
        icon: DollarSign,
        title: "Revenue Loss",
        description: "Unbilled hours and forgotten tasks cost 15-25% revenue",
        stat: "15-25%",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10"
    },
    {
        icon: Clock,
        title: "Admin Overhead",
        description: "20+ hours weekly on status updates vs actual work",
        stat: "20+ hrs",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        icon: Target,
        title: "Missed Deadlines",
        description: "60% of projects delivered late due to poor planning",
        stat: "60%",
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        icon: TrendingDown,
        title: "Budget Overruns",
        description: "Projects exceed budget by 27% on average",
        stat: "27%",
        color: "text-pink-400",
        bg: "bg-pink-500/10"
    },
    {
        icon: DollarSign,
        title: "Client Churn",
        description: "Poor communication leads to 35% client dissatisfaction",
        stat: "35%",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10"
    },
    {
        icon: Clock,
        title: "Team Burnout",
        description: "Unclear priorities cause 45% productivity loss",
        stat: "45%",
        color: "text-green-400",
        bg: "bg-green-500/10"
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut" as const
        }
    }
};

export function ProblemStatement() {
    return (
        <section className="py-24 relative bg-gradient-to-b from-background to-background/50 overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-3xl md:text-5xl font-bold text-text-primary mb-6"
                    >
                        The Hidden Cost of{' '}
                        <span className="text-primary">
                            Poor Project Management
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                        className="text-lg text-text-secondary"
                    >
                        Most teams lose 20-40% of their potential revenue to preventable project management issues.
                        Here's what's costing you money right now:
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-text-tertiary mt-4"
                    >
                        👉 Scroll to explore →
                    </motion.p>
                </div>

                {/* Horizontal Scroll Container */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                >
                    <div className="overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
                        <div className="flex gap-4 px-4 min-w-max">
                            {problems.map((problem, index) => (
                                <motion.div
                                    key={problem.title}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -5,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="relative p-6 rounded-2xl glass-medium border border-white/10 hover:border-white/20 transition-all group cursor-pointer w-[320px] flex-shrink-0"
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <motion.div
                                                className={`p-3 rounded-xl ${problem.bg} ${problem.color} flex-shrink-0`}
                                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <problem.icon className="w-6 h-6" />
                                            </motion.div>
                                            <motion.span
                                                className={`text-3xl font-bold ${problem.color}`}
                                                initial={{ scale: 1 }}
                                                whileInView={{ scale: [1, 1.2, 1] }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                                            >
                                                {problem.stat}
                                            </motion.span>
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors mb-3">
                                            {problem.title}
                                        </h3>
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            {problem.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll Indicators */}
                    <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-12 text-center"
                >
                    <p className="text-text-secondary text-lg">
                        Sound familiar? <span className="text-primary font-semibold">You're not alone.</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
