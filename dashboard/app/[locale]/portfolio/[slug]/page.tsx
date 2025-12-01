import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSession } from "@/lib/auth";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
    const session = await getSession();
    const { slug } = params;

    // In a real app, fetch data based on slug
    const title = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar user={session} />
            <main className="container mx-auto px-4 py-24">
                <Link href="/portfolio" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio
                </Link>

                <Typography variant="h1" className="text-4xl md:text-6xl font-bold mb-6">
                    {title}
                </Typography>

                <div className="aspect-video bg-secondary/30 rounded-2xl mb-12 flex items-center justify-center">
                    <span className="text-muted-foreground">Case Study Hero Image</span>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                        <Typography variant="h2">Overview</Typography>
                        <Typography variant="p">
                            Detailed description of the case study goes here. This section would explain the problem, the approach, and the solution in depth.
                        </Typography>

                        <Typography variant="h2">The Challenge</Typography>
                        <Typography variant="p">
                            What were the main pain points? What needed to be solved?
                        </Typography>

                        <Typography variant="h2">The Solution</Typography>
                        <Typography variant="p">
                            How did we approach the design and development? What technologies were used?
                        </Typography>
                    </div>

                    <div className="space-y-8">
                        <div className="p-6 bg-secondary/20 rounded-xl">
                            <Typography variant="h4" className="mb-4">Project Details</Typography>
                            <ul className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Client</div>
                                    <div className="font-medium">Client Name</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Timeline</div>
                                    <div className="font-medium">3 Months</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Role</div>
                                    <div className="font-medium">Product Design, Frontend Dev</div>
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
