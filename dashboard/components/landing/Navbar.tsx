'use client';

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar({ user }: { user?: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'border-b border-border bg-background/80 backdrop-blur-xl'
                    : 'border-b border-transparent bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
                            <span className="text-background font-black text-sm tracking-tight">F</span>
                        </div>
                        <span className="text-foreground font-semibold text-sm tracking-tight">Flow</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-foreground/50 hover:text-foreground transition-colors">Features</a>
                        <a href="#pricing" className="text-sm text-foreground/50 hover:text-foreground transition-colors">Pricing</a>
                        <a href="#about" className="text-sm text-foreground/50 hover:text-foreground transition-colors">About</a>
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Open Dashboard
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/sign-in" className="text-sm text-foreground/50 hover:text-foreground transition-colors">
                                    Log in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Get started
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                    <div className="md:hidden pl-2">
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border bg-background/90 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            <a href="#features" className="text-sm text-foreground/60 hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Features</a>
                            <a href="#pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Pricing</a>
                            <a href="#about" className="text-sm text-foreground/60 hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>About</a>
                            <div className="pt-4 border-t border-border flex flex-col gap-3">
                                {user ? (
                                    <Link href="/dashboard" className="w-full text-center px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold">Open Dashboard</Link>
                                ) : (
                                    <>
                                        <Link href="/sign-in" className="text-sm text-center text-foreground/60 hover:text-foreground transition-colors">Log in</Link>
                                        <Link href="/sign-up" className="w-full text-center px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold">Get started</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
