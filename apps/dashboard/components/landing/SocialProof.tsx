'use client';

import { motion } from "framer-motion";

const proofCards = [
    {
        team: "12-person product agency",
        metric: "$8.4k recovered in approved change orders during the first quarter",
        quote: "We stopped treating vague client asks like free work. Flow gave us the language and the numbers before the project slipped.",
    },
    {
        team: "Freelance design studio",
        metric: "6 hours saved each week on client updates and follow-ups",
        quote: "The biggest win was clarity. Clients could see what was in scope, what was extra, and what it would cost before the work started.",
    },
    {
        team: "In-house delivery team",
        metric: "3 at-risk requests flagged before they turned into unplanned sprint work",
        quote: "Instead of arguing after delivery, we caught the change when it still looked like a harmless ask in chat.",
    },
];

export function SocialProofSection() {
    return (
        <section id="social-proof" className="relative py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/60 uppercase tracking-widest mb-4">
                        <div className="w-4 h-px bg-foreground/20" />
                        Beta proof
                        <div className="w-4 h-px bg-foreground/20" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-6">
                        Built with teams that got tired of
                        <br />
                        <span className="text-orange-400">giving work away for free.</span>
                    </h2>

                    <p className="text-foreground/70 text-lg leading-relaxed">
                        These early results come from anonymized beta teams using Flow to catch scope drift, tighten client communication, and protect delivery margin.
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-4 md:grid-cols-3">
                    {proofCards.map((card, index) => (
                        <motion.article
                            key={card.team}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            className="rounded-2xl border border-border bg-foreground/[0.03] p-6"
                        >
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                                {card.team}
                            </div>
                            <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-foreground">
                                {card.metric}
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-foreground/72">
                                “{card.quote}”
                            </p>
                        </motion.article>
                    ))}
                </div>

                <p className="mt-6 text-center text-sm text-foreground/50">
                    Quotes are anonymized to respect current beta teams and client confidentiality.
                </p>
            </div>
        </section>
    );
}
