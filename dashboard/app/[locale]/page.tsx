import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/Problem";
import { SolutionSection } from "@/components/landing/Solution";
import { UseCasesSection } from "@/components/landing/UseCases";
import { SocialProofSection } from "@/components/landing/SocialProof";
import { FAQSection } from "@/components/landing/FAQ";
import { PricingSection } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SystemProcess } from "@/components/landing/SystemProcess";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0e0dbcba-8565-423c-afc9-9ff8dcbd2ea3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'landing/page.tsx:12', message: 'LandingPage component rendering', data: {}, timestamp: Date.now(), sessionId: 'debug-session-dec25-final', hypothesisId: 'H19' }) }).catch(() => { });
    // #endregion
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
                <FAQSection />
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
}
