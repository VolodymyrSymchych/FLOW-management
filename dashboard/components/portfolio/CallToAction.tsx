"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ArrowRight } from "lucide-react";

export const CallToAction = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600/5 dark:bg-indigo-900/10" />
            <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <Typography variant="h2" className="text-4xl md:text-5xl font-bold">
                        Ready to start your next project?
                    </Typography>
                    <Typography variant="p" className="text-xl text-muted-foreground">
                        Let's collaborate to build something extraordinary.
                    </Typography>

                    <div className="pt-4">
                        <Button size="lg" className="rounded-xl px-8 py-4 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white">
                            Get in Touch <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
