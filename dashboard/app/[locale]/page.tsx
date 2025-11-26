import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/Problem";
import { SolutionSection } from "@/components/landing/Solution";
import { UseCasesSection } from "@/components/landing/UseCases";
import { SocialProofSection } from "@/components/landing/SocialProof";
import { PricingSection } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SystemProcess } from "@/components/landing/SystemProcess";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
    const session = await getSession();

    return (
        <div className="landing-theme min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
            <Navbar user={session} />
            <main>
                <Hero user={session} />
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
