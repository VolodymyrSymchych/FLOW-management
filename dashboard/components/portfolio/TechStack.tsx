"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";

const technologies = [
    "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "GraphQL", "PostgreSQL", "AWS", "Figma", "Docker"
];

export const TechStack = () => {
    return (
        <section className="py-20 border-t border-border/50">
            <div className="container mx-auto px-4 text-center">
                <Typography variant="h3" className="text-2xl font-semibold mb-10 text-muted-foreground">
                    Technologies & Tools
                </Typography>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {technologies.map((tech, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="px-6 py-3 rounded-full bg-secondary/50 text-secondary-foreground font-medium hover:bg-secondary transition-colors cursor-default"
                        >
                            {tech}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
