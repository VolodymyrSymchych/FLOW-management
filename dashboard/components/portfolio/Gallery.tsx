"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";

export const Gallery = () => {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4 mb-12 text-center">
                <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
                    Visual Exploration
                </Typography>
                <Typography variant="p" className="text-muted-foreground max-w-2xl mx-auto">
                    A glimpse into the design details and user interfaces crafted with precision.
                </Typography>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 px-4 snap-x snap-mandatory scrollbar-hide">
                {[1, 2, 3, 4, 5].map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex-none w-[80vw] md:w-[40vw] aspect-[4/3] relative rounded-2xl overflow-hidden shadow-lg snap-center bg-secondary/20"
                    >
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl">
                            Image {item}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
