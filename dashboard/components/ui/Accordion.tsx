'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AccordionItem {
    id: string;
    title: string;
    content: string | React.ReactNode;
}

export interface AccordionProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultOpen?: string[];
    className?: string;
}

export function Accordion({
    items,
    allowMultiple = false,
    defaultOpen = [],
    className = ''
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            if (prev.includes(id)) {
                // Close the item
                return prev.filter(itemId => itemId !== id);
            } else {
                // Open the item
                if (allowMultiple) {
                    return [...prev, id];
                } else {
                    return [id];
                }
            }
        });
    };

    const isOpen = (id: string) => openItems.includes(id);

    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((item) => (
                <div
                    key={item.id}
                    className="glass-medium rounded-xl border border-white/10 overflow-hidden transition-all duration-200 hover:glass-light"
                >
                    <button
                        onClick={() => toggleItem(item.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleItem(item.id);
                            }
                        }}
                        className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
                        aria-expanded={isOpen(item.id)}
                        aria-controls={`accordion-content-${item.id}`}
                    >
                        <span className="font-semibold text-text-primary pr-4">
                            {item.title}
                        </span>
                        <motion.div
                            animate={{ rotate: isOpen(item.id) ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="flex-shrink-0"
                        >
                            <ChevronDown className="w-5 h-5 text-text-secondary" />
                        </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                        {isOpen(item.id) && (
                            <motion.div
                                id={`accordion-content-${item.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: 'auto',
                                    opacity: 1,
                                    transition: {
                                        height: { duration: 0.3, ease: 'easeOut' },
                                        opacity: { duration: 0.2, delay: 0.1 }
                                    }
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                    transition: {
                                        height: { duration: 0.2, ease: 'easeIn' },
                                        opacity: { duration: 0.1 }
                                    }
                                }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-4 text-text-secondary text-sm leading-relaxed border-t border-white/5 pt-4">
                                    {typeof item.content === 'string' ? (
                                        <p>{item.content}</p>
                                    ) : (
                                        item.content
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
