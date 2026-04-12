'use client';

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { WaitlistForm } from "./WaitlistForm";

export function CTABanner({ user }: { user?: any }) {
    return (
        <section className="relative py-32 overflow-visible">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                <div className="absolute left-[30%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-500/10 dark:bg-orange-900/30 blur-[140px] rounded-full" />
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
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400">revenue today.</span>
                    </h2>
                    <p className="text-lg text-foreground/40 mb-10">
                        Join 500+ teams that never miss a billable moment.
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
                        <div className="flex flex-col items-center gap-4">
                            <WaitlistForm className="w-full max-w-md" />
                            <Link href="/sign-up" className="text-sm text-foreground/30 hover:text-foreground/60 transition-colors">
                                Already have an account? Sign in →
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
