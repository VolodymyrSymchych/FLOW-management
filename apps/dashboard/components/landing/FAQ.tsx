'use client';

import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqItems = [
    {
        id: 'how-it-works',
        title: 'How does scope detection work?',
        content: 'Our AI analyzes your project requirements, user stories, and change requests in real-time. It compares new requests against the original scope using natural language processing and machine learning to identify potential scope creep before it impacts your timeline or budget.'
    },
    {
        id: 'scope-detected',
        title: 'What happens when scope creep is detected?',
        content: 'When scope creep is detected, the system immediately flags the change request and provides a detailed impact analysis including estimated time, cost, and resource implications. You can then decide whether to approve the change, negotiate with stakeholders, or defer it to a future phase.'
    },
    {
        id: 'customization',
        title: 'Can I customize the AI sensitivity?',
        content: 'Yes! You can adjust the sensitivity levels to match your project needs. Set strict boundaries for fixed-price contracts or more flexible parameters for agile projects. The system learns from your decisions over time to provide increasingly accurate recommendations.'
    },
    {
        id: 'pricing',
        title: 'How much does it cost?',
        content: 'We offer flexible pricing plans starting with a free tier for individual developers. Paid plans start at $29/month, and enterprise plans with custom features and dedicated support are available. All plans include unlimited projects and AI-powered scope detection.'
    },
    {
        id: 'data-security',
        title: 'Is my project data secure?',
        content: 'Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your project data is stored in secure, SOC 2 compliant data centers. We never share your data with third parties, and you maintain full ownership of all your project information.'
    },
    {
        id: 'integrations',
        title: 'What integrations are supported?',
        content: 'We integrate seamlessly with popular project management tools including Jira, Asana, Trello, GitHub, GitLab, and Slack. Our REST API also allows you to build custom integrations with your existing workflow tools.'
    },
    {
        id: 'team-size',
        title: 'Is this suitable for my team size?',
        content: 'Yes! Our platform scales from solo freelancers to enterprise teams of 1000+ members. Whether you\'re managing a single project or coordinating multiple teams across different time zones, our tools adapt to your needs.'
    },
    {
        id: 'getting-started',
        title: 'How quickly can I get started?',
        content: 'You can be up and running in minutes! Simply sign up, create your first project, and import your existing requirements. Our AI will immediately start analyzing your project scope. We also offer onboarding assistance and comprehensive documentation to help you get the most value from day one.'
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
