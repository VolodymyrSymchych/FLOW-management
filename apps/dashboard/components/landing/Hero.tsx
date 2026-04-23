'use client';

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

const LiveScopeDemo = dynamic(
    () => import('./LiveScopeDemo').then((m) => ({ default: m.LiveScopeDemo })),
    {
        ssr: false,
        loading: () => <div className="h-[400px] animate-pulse rounded-2xl bg-foreground/5" />,
    }
);

const proofPoints = [
    'Scope Score in seconds \u2014 before you sign the contract',
    'Flags \u201cquick asks\u201d that quietly drain your margin',
    "Drafts the change-order reply so you don't have to",
];

export function Hero({ user }: { user?: any }) {
    return (
        <section className="relative overflow-x-clip pt-24">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute right-0 top-0 h-[780px] w-[780px] translate-x-1/4 -translate-y-1/4 rounded-full bg-orange-900/25 blur-[150px]" />
                <div className="absolute bottom-0 left-0 h-[540px] w-[540px] -translate-x-1/4 translate-y-1/4 rounded-full bg-sky-900/10 blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 lg:px-8 lg:pb-16">
                <div className="flex flex-col gap-12">
                    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
                        <div className="w-full">
                            <motion.h1
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                                className="text-4xl font-black leading-[1.0] tracking-[-0.04em] text-foreground md:text-6xl xl:text-[64px]"
                            >
                                Your brief scores{" "}
                                <span className="text-orange-400">34/100.</span>
                                <br />
                                Here&apos;s what will
                                <br />
                                cost you.
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-6 max-w-4xl text-lg leading-8 text-foreground/82 md:text-xl"
                            >
                                Flow reads your project brief, finds the gaps before work starts, and catches client asks that should be billed — not absorbed.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-8 space-y-3"
                            >
                                {proofPoints.map((point) => (
                                    <div key={point} className="flex items-start gap-3 text-sm leading-6 text-foreground/85">
                                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-10 max-w-2xl"
                            >
                                {user ? (
                                    <div className="flex flex-col items-start gap-4">
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            Open Dashboard
                                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href="#kill-feature"
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            See it in action
                                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <WaitlistForm className="w-full" variant="compact" />
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                            className="self-center xl:justify-self-end"
                        >
                            <div className="rounded-[28px] border border-border bg-foreground/[0.03] p-6 shadow-[0_20px_60px_rgba(15,15,14,0.06)]">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                                    What teams catch with Flow
                                </div>
                                <div className="mt-5 space-y-4">
                                    {[
                                        { stat: "40%", label: "of projects hit scope creep before delivery slows down" },
                                        { stat: "25%", label: "of revenue typically goes unbilled without tight scope control" },
                                        { stat: "20h+", label: "a week disappears into admin when updates stay manual" },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-border bg-background/70 px-4 py-4">
                                            <div className="text-3xl font-black tracking-[-0.04em] text-orange-400">{item.stat}</div>
                                            <p className="mt-1 text-sm leading-6 text-foreground/68">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full"
                    >
                        <LiveScopeDemo />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
