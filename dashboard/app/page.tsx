'use client';

import { Hero } from '@/components/landing/Hero';
import { ProblemStatement } from '@/components/landing/ProblemStatement';
import { Solution } from '@/components/landing/Solution';
import { Features } from '@/components/landing/Features';
import { UseCases } from '@/components/landing/UseCases';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated by checking for session cookie
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                });
                setIsAuthenticated(response.ok);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30">
            <AnimatedBackground />
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass-medium backdrop-blur-xl">
                <div className="container px-4 mx-auto h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo variant="compact" />
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="#problem" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                The Problem
                            </Link>
                            <Link href="#solution" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                Solution
                            </Link>
                            <Link href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                Features
                            </Link>
                            <Link href="#use-cases" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                Use Cases
                            </Link>
                            <Link href="#pricing" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                Pricing
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isLoading && (
                            <>
                                {isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 rounded-lg glass-button text-white text-sm font-medium hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Let's Get to Work →
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/sign-in"
                                            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/sign-in"
                                            className="px-4 py-2 rounded-lg glass-button text-white text-sm font-medium hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                <Hero isAuthenticated={isAuthenticated} />
                <div id="problem">
                    <ProblemStatement />
                </div>
                <div id="solution">
                    <Solution />
                </div>
                <div id="features">
                    <Features />
                </div>
                <div id="use-cases">
                    <UseCases />
                </div>
                <div id="pricing">
                    <Pricing />
                </div>
            </main>

            <Footer />
        </div>
    );
}
