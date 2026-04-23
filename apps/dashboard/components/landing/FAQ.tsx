'use client';

import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqItems = [
    {
        id: 'how-it-works',
        title: 'How does scope detection work?',
        content: 'You upload your project brief or SOW. Flow\'s AI reads it, generates a Scope Score (0–100), and identifies risks, ambiguities, and missing requirements — before work starts. During the project, you paste client requests and Flow checks them against the original brief in seconds.'
    },
    {
        id: 'team-workflow',
        title: 'Do I need to change how my team works?',
        content: 'No. Start by uploading a brief and seeing the Score. Most teams are up and running in under 10 minutes. The workflow fits around what you already do — it doesn\'t replace it.'
    },
    {
        id: 'language',
        title: 'What if the client brief is in another language?',
        content: 'Flow auto-detects and processes briefs in any language. Outputs are delivered in the language of your interface.'
    },
    {
        id: 'solo-use',
        title: 'Can I use this without a full team?',
        content: 'Yes. The Freelancer plan is built for solo operators managing multiple clients. You get all the core scope protection — just without team features.'
    },
    {
        id: 'scope-detected',
        title: 'What happens when scope creep is detected?',
        content: 'Flow flags the request, shows you which part of the brief it conflicts with, estimates the cost of the extra work, and drafts a reply you can send to the client directly. You review and send — or edit and send.'
    },
    {
        id: 'vs-clickup',
        title: 'How is this different from ClickUp or Asana?',
        content: 'Those tools track what\'s done. Flow protects what\'s owed. No project management tool reads your brief and tells you what\'s going to go wrong before work starts. That\'s the gap Flow closes.'
    },
    {
        id: 'data-security',
        title: 'Is my data secure?',
        content: 'Yes. All documents are encrypted in transit and at rest. We don\'t train our models on your project data.'
    },
    {
        id: 'demo',
        title: 'Can I get a demo?',
        content: 'The live demo is on the homepage — upload any brief and see a real Scope Score in seconds. No signup required.'
    }
];

const FAQSection = memo(function FAQSection() {
    const [openItem, setOpenItem] = useState<string>('how-it-works');

    return (
        <section className="py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-3xl text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/60 uppercase tracking-widest mb-4">
                        <div className="w-4 h-px bg-foreground/20" />
                        FAQ
                        <div className="w-4 h-px bg-foreground/20" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                        Questions before you join?
                    </h2>
                    <p className="mt-5 text-foreground/70 text-lg max-w-2xl mx-auto">
                        Everything you need to understand how Flow handles scope, pricing, rollout, and day-to-day delivery pressure.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="space-y-3">
                        {faqItems.map((item) => {
                            const isOpen = openItem === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="overflow-hidden rounded-2xl border border-border bg-foreground/[0.02]"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenItem(isOpen ? '' : item.id)}
                                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-foreground/[0.03]"
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-panel-${item.id}`}
                                    >
                                        <span className="text-base font-semibold text-foreground">{item.title}</span>
                                        <motion.span
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            className="flex-shrink-0 text-foreground/55"
                                        >
                                            <ChevronDown className="h-5 w-5" />
                                        </motion.span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                id={`faq-panel-${item.id}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t border-border px-6 py-5 text-sm leading-7 text-foreground/72">
                                                    {item.content}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <p className="text-foreground/60 mb-4">
                        Still have questions?
                    </p>
                    <a
                        href="mailto:support@flow.app"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold transition-colors hover:bg-foreground/90"
                    >
                        Contact Support
                    </a>
                </motion.div>
            </div>
        </section>
    );
});

export { FAQSection };
