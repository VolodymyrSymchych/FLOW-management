import { Hero } from "@/components/portfolio/Hero";
import { Features } from "@/components/portfolio/Features";
import { Results } from "@/components/portfolio/Results";
import { TechStack } from "@/components/portfolio/TechStack";
import { Gallery } from "@/components/portfolio/Gallery";
import { CallToAction } from "@/components/portfolio/CallToAction";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSession } from "@/lib/auth";

export default async function PortfolioPage() {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 font-sans">
            <Navbar user={session} />
            <main>
                <Hero />
                <Features />
                <Results />
                <Gallery />
                <TechStack />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
}
