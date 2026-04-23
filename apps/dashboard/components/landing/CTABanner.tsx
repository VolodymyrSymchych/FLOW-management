'use client';

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { WaitlistForm } from "./WaitlistForm";

export function CTABanner({ user }: { user?: any }) {
    return (
        <section id="join" className="relative py-32 overflow-visible">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-500/10 dark:bg-orange-900/30 blur-[140px] rounded-full" />
            </div>

            <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight mb-6">
                        Start protecting your
                        <br />
                        <span className="text-orange-400">revenue today.</span>
                    </h2>
                    <p className="text-lg text-foreground/70 mb-10">
                        Join the private beta. Never give work away for free again.
                    </p>

                    {user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-foreground text-background text-base font-bold hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/10"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <WaitlistForm className="w-full max-w-md" />
                    )}
                </motion.div>
            </div>
        </section>
    );
}
