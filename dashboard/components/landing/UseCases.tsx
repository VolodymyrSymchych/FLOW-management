import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Code2, Briefcase, Rocket, Building2, Users, Palette, Globe, Laptop } from "lucide-react";

const useCases = [
    {
        icon: Code2,
        title: "Freelancers & Solo Devs",
        description: "Track every hour, automate invoices, and show clients exactly what they're paying for. Never lose billable time again.",
        features: ["Time Tracking", "Automated Invoices", "Client Portal"],
        metric: "Save 15+ hours monthly",
        color: "text-[#8098f9]",
        borderColor: "border-[#8098f9]/20",
        bgHover: "hover:bg-[#8098f9]/5"
    },
    {
        icon: Briefcase,
        title: "Development Agencies",
        description: "Keep stakeholders aligned and margins healthy with AI insights. Track profitability across all client projects.",
        features: ["Resource Management", "Profitability Tracking", "White-label Reports"],
        metric: "Reduce overruns by 40%",
        color: "text-[#d946ef]",
        borderColor: "border-[#d946ef]/20",
        bgHover: "hover:bg-[#d946ef]/5"
    },
    {
        icon: Rocket,
        title: "Product Teams & Startups",
        description: "Keep your roadmap aligned with reality. AI-powered insights help you prioritize what actually matters.",
        features: ["Sprint Planning", "Velocity Tracking", "Scope Validation"],
        metric: "Improve velocity by 30%",
        color: "text-[#3b82f6]",
        borderColor: "border-[#3b82f6]/20",
        bgHover: "hover:bg-[#3b82f6]/5"
    },
    {
        icon: Building2,
        title: "Enterprise Organizations",
        description: "Portfolio-level visibility across all projects. Custom AI models, SSO, and dedicated support for large teams.",
        features: ["SSO & Security", "Custom AI Models", "API Access"],
        metric: "Protect $2M+ annual revenue",
        color: "text-[#6366f1]",
        borderColor: "border-[#6366f1]/20",
        bgHover: "hover:bg-[#6366f1]/5"
    },
    {
        icon: Users,
        title: "Consulting Firms",
        description: "Track consultant time across multiple clients and projects. Automated invoicing ensures nothing falls through the cracks.",
        features: ["Multi-client Tracking", "Consultant Analytics", "Automated Billing"],
        metric: "Recover 20% unbilled hours",
        color: "text-[#22c55e]",
        borderColor: "border-[#22c55e]/20",
        bgHover: "hover:bg-[#22c55e]/5"
    },
    {
        icon: Palette,
        title: "Design Studios",
        description: "Focus on design, not admin. Track revisions, scope changes, and billable hours automatically.",
        features: ["Revision Tracking", "Client Approval", "Visual Scope Compare"],
        metric: "Reduce admin time by 60%",
        color: "text-[#f59e0b]",
        borderColor: "border-[#f59e0b]/20",
        bgHover: "hover:bg-[#f59e0b]/5"
    },
    {
        icon: Globe,
        title: "Remote Teams",
        description: "Real-time visibility into project scope and progress. AI detects risks before they become problems.",
        features: ["Async Communication", "Time Zone Mgmt", "Global Analytics"],
        metric: "Improve alignment by 50%",
        color: "text-[#6366f1]",
        borderColor: "border-[#6366f1]/20",
        bgHover: "hover:bg-[#6366f1]/5"
    },
    {
        icon: Laptop,
        title: "SaaS Founders",
        description: "Balance feature requests with technical debt. Ensure you're building the right features at the right time.",
        features: ["Feature Prioritization", "Tech Debt Tracking", "User Feedback"],
        metric: "Reduce churn by 25%",
        color: "text-[#d946ef]",
        borderColor: "border-[#d946ef]/20",
        bgHover: "hover:bg-[#d946ef]/5"
    }
];

export function UseCasesSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Adjust the range based on how many items and their width
    // We want to scroll from 1% to roughly -75% to show all cards
    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-85%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Built for Teams Like Yours
                        </h2>
                        <p className="text-lg text-gray-400">
                            Whether you're a solo developer or a global enterprise, we have the tools you need
                            to stop scope creep and maximize revenue.
                        </p>
                    </div>

                    <motion.div style={{ x }} className="flex gap-8">
                        {useCases.map((item, index) => (
                            <div
                                key={index}
                                className={`glass-card p-6 rounded-2xl border ${item.borderColor} ${item.bgHover} transition-all duration-300 group flex flex-col h-[400px] w-[350px] flex-shrink-0`}
                            >
                                <div className="mb-6">
                                    <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <div className="space-y-2">
                                        {item.features.map((feature, i) => (
                                            <div key={i} className="flex items-center text-xs text-gray-500">
                                                <div className={`w-1 h-1 rounded-full ${item.color.replace('text-', 'bg-')} mr-2`} />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`pt-4 border-t border-white/5 text-xs font-semibold ${item.color}`}>
                                        {item.metric}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
