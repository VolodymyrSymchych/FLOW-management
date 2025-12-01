"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export const Hero = () => {
    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background pt-20 pb-16">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <Typography variant="h1" className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        Building Digital Experiences That Matter
                    </Typography>

                    <Typography variant="lead" className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                        A showcase of strategic design, technical excellence, and user-centric solutions.
                    </Typography>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button size="lg" className="rounded-xl px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 text-white border-0">
                            View Case Studies
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-xl px-8 py-4 text-lg hover:bg-secondary/50 transition-all duration-300">
                            Contact Me
                        </Button>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
                >
                    <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center p-1">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
