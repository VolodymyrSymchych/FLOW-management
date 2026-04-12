'use client';

import { motion } from "framer-motion";
import { Twitter, Github, Linkedin } from "lucide-react";
import Link from "next/link";

const links = {
    Product: ["Features", "Pricing", "Case Studies", "API", "Integrations"],
    Company: ["About Us", "Careers", "Blog", "Legal", "Contact"],
};

export function Footer() {
    return (
        <footer className="relative bg-background border-t border-foreground/[0.06] pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                <span className="text-black font-black text-sm">F</span>
                            </div>
                            <span className="text-foreground font-bold tracking-tight">Flow</span>
                        </div>
                        <p className="text-sm text-foreground/30 max-w-xs leading-relaxed mb-6">
                            AI-powered project management that catches scope creep, automates invoicing, and keeps every deadline.
                        </p>
                        <div className="flex gap-3">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-white/[0.08] transition-colors">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {Object.entries(links).map(([group, items]) => (
                        <div key={group}>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-5">{group}</h4>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-foreground/30 hover:text-foreground transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-foreground/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/20">© 2026 Flow Management Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-white/20">
                        <a href="#" className="hover:text-foreground/40 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground/40 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-foreground/40 transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
