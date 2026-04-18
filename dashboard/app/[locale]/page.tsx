import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/Problem";
import { SolutionSection } from "@/components/landing/Solution";
import { AwkwardEmailTool } from "@/components/landing/AwkwardEmailTool";
import { SocialProofSection } from "@/components/landing/SocialProof";
import { PricingSection } from "@/components/landing/Pricing";
import { FAQSection } from "@/components/landing/FAQ";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/landing/Footer";
import { LandingMotionProvider } from "@/components/landing/MotionProvider";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
    const session = await getSession();

    return (
        <LandingMotionProvider>
            <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background"
                >
                    Skip to main content
                </a>
                <Navbar user={session} />
                <main id="main-content" tabIndex={-1}>
                    <Hero user={session} />
                    <ProblemSection />
                    <SolutionSection />
                    <AwkwardEmailTool />
                    <SocialProofSection />
                    <PricingSection />
                    <FAQSection />
                    <CTABanner user={session} />
                </main>
                <Footer />
            </div>
        </LandingMotionProvider>
    );
}
