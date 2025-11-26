'use client';

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/Problem";
import { SolutionSection } from "@/components/landing/Solution";
import { UseCasesSection } from "@/components/landing/UseCases";
import { SocialProofSection } from "@/components/landing/SocialProof";
import { PricingSection } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SystemProcess } from "@/components/landing/SystemProcess";

export default function LandingPage() {
    return (
        <div className="landing-theme min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
            <Navbar />
            <main>
                <Hero />
                <ProblemSection />
                <SolutionSection />
                <SystemProcess />
                <UseCasesSection />
                <SocialProofSection />
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
}
