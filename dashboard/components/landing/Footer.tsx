'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background/50 backdrop-blur-xl pt-16 pb-8">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">

                        <p className="text-text-secondary max-w-sm mb-6">
                            The AI-powered project management platform that helps you ship faster, track scope creep, and manage your team with precision.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-lg glass-light text-text-secondary hover:text-primary hover:bg-white/10 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-lg glass-light text-text-secondary hover:text-primary hover:bg-white/10 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-lg glass-light text-text-secondary hover:text-primary hover:bg-white/10 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-text-primary mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Changelog</Link></li>
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Documentation</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-text-primary mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="text-text-secondary hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-text-tertiary">
                        © {new Date().getFullYear()} Project Scope Analyzer. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-text-tertiary">
                        <Link href="#" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
