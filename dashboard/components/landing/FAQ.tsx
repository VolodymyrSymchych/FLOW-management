'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { HelpCircle } from 'lucide-react';

const faqItems: AccordionItem[] = [
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
        content: 'We offer flexible pricing plans starting with a free tier for individual developers. Team plans start at $29/month per user, and enterprise plans with custom features and dedicated support are available. All plans include unlimited projects and AI-powered scope detection.'
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
    return (
        <section className="py-24 bg-gradient-to-b from-black/20 via-black/10 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <HelpCircle className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Got questions? We've got answers. Learn more about how our platform can help you manage scope creep.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <Accordion
                        items={faqItems}
                        allowMultiple={false}
                        defaultOpen={['how-it-works']}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <p className="text-gray-400 mb-4">
                        Still have questions?
                    </p>
                    <a
                        href="mailto:support@projectscope.com"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Contact Support
                    </a>
                </motion.div>
            </div>
        </section>
    );
});

export { FAQSection };
