"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";

const metrics = [
    { label: "User Satisfaction", value: "98%" },
    { label: "Revenue Increase", value: "45%" },
    { label: "Projects Delivered", value: "150+" },
    { label: "Awards Won", value: "12" },
];

export const Results = () => {
    return (
        <section className="bg-secondary/30 py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
                        Impact & Results
                    </Typography>
                    <Typography variant="p" className="text-muted-foreground max-w-2xl mx-auto">
                        Delivering measurable value through design and engineering excellence.
                    </Typography>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center p-6 rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                                {metric.value}
                            </div>
                            <div className="text-sm md:text-base font-medium text-muted-foreground">
                                {metric.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
