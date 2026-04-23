'use client';

import { Twitter, Github, Linkedin } from "lucide-react";

const links = {
    Product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Email Tool", href: "#kill-feature" },
    ],
    Company: [
        { label: "Privacy Policy", href: "mailto:legal@flow.app?subject=Privacy%20Policy" },
        { label: "Terms", href: "mailto:legal@flow.app?subject=Terms%20of%20Service" },
        { label: "Contact", href: "mailto:hello@flow.app?subject=Contact" },
    ],
};

const socials = [
    { Icon: Twitter, label: "Twitter", href: "https://twitter.com/flow" },
    { Icon: Github, label: "GitHub", href: "https://github.com/flow" },
    { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/flow" },
];

export function Footer() {
    return (
        <footer className="relative bg-background border-t border-foreground/[0.06] pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center" aria-hidden="true">
                                <span className="text-background font-black text-sm">F</span>
                            </div>
                            <span className="text-foreground font-bold tracking-tight">Flow</span>
                        </div>
                        <p className="text-sm text-foreground/70 max-w-xs leading-relaxed mb-6">
                            Flow — AI that reads your brief before your team does.
                        </p>
                        <ul className="flex gap-3 list-none p-0 m-0" aria-label="Social media">
                            {socials.map(({ Icon, label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="w-11 h-11 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-colors"
                                    >
                                        <Icon className="w-4 h-4" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {Object.entries(links).map(([group, items]) => (
                        <div key={group}>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-5">{group}</h2>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <a href={item.href} className="text-sm text-foreground/80 hover:text-foreground transition-colors">{item.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-foreground/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-foreground/70">© 2026 Flow Management Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-foreground/70">
                        <a href="mailto:legal@flow.app?subject=Privacy%20Policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="mailto:legal@flow.app?subject=Terms%20of%20Service" className="hover:text-foreground transition-colors">Terms of Service</a>
                        <a href="mailto:legal@flow.app?subject=Cookie%20Policy" className="hover:text-foreground transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
