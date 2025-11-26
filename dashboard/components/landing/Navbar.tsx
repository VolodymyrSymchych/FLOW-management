'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const logo = "/logo.png";

export function Navbar({ user }: { user?: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <img
                                src={logo}
                                alt="FLOW management"
                                className="h-8 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#features" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">Features</a>
                            <a href="#pricing" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">Pricing</a>
                            <a href="#about" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">About</a>

                            {user ? (
                                <Link href="/dashboard" className="glass-button rounded-full px-5 py-2 text-sm font-medium text-white">
                                    Let's get to work
                                </Link>
                            ) : (
                                <>
                                    <Link href="/sign-in" className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
                                        Sign In
                                    </Link>
                                    <Link href="/sign-up" className="glass-button rounded-full px-5 py-2 text-sm font-medium text-white">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/10 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10"
                >
                    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                        <a href="#features" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white">Features</a>
                        <a href="#pricing" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white">Pricing</a>
                        <a href="#about" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white">About</a>
                        <div className="mt-4 flex flex-col gap-2 px-3">
                            {user ? (
                                <Link href="/dashboard" className="glass-button w-full block text-center rounded-md px-4 py-2 text-sm font-medium text-white">
                                    Let's get to work
                                </Link>
                            ) : (
                                <>
                                    <Link href="/sign-in" className="w-full block text-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                                        Sign In
                                    </Link>
                                    <Link href="/sign-up" className="glass-button w-full block text-center rounded-md px-4 py-2 text-sm font-medium text-white">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </nav>
    );
}
