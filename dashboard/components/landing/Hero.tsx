'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { InteractiveMockup } from "./InteractiveMockup";
import { WaitlistForm } from "./WaitlistForm";

export function Hero({ user }: { user?: any }) {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-x-clip pt-14">
            {/* Background radial glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-900/30 rounded-full blur-[140px] translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-900/20 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />
                <div className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">
                {/* Eyebrow badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-foreground/[0.12] bg-foreground/[0.04] backdrop-blur-sm text-sm font-medium text-foreground/70 cursor-default">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                        Introducing AI Scope Guard
                        <span className="text-foreground/30">·</span>
                        <span className="text-orange-400">Learn more →</span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center text-5xl md:text-7xl lg:text-[88px] font-black tracking-[-0.04em] text-foreground leading-[1.0] mb-6 max-w-5xl"
                >
                    Project management
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-400 to-orange-400">
                        built for revenue.
                    </span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center text-lg md:text-xl text-foreground/40 max-w-2xl mb-10 leading-relaxed"
                >
                    Flow catches scope creep, automates invoicing, and gives your team real-time visibility — before clients ask why things are late.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full max-w-lg"
                >
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/10"
                        >
                            Open Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <>
                            <WaitlistForm className="w-full" variant="compact" />
                            <Link href="/sign-up" className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors whitespace-nowrap">
                                Or sign up free →
                            </Link>
                        </>
                    )}
                </motion.div>

                {/* Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                >
                    <InteractiveMockup />
                </motion.div>
            </div>
        </section>
    );
}
