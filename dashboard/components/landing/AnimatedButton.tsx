'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
    href: string;
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export function AnimatedButton({ href, children, variant = 'primary', className = '' }: AnimatedButtonProps) {
    const baseClass = variant === 'primary'
        ? 'glass-button text-white'
        : 'glass-light text-text-primary hover:glass-medium';

    return (
        <Link href={href}>
            <motion.div
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${baseClass} ${className}`}
                whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 }
                }}
            >
                {children}
            </motion.div>
        </Link>
    );
}
