import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { FeatureView } from "@/components/landing/FeatureView";

const featuresData: Record<string, {
    title: string;
    description: string;
    icon: string;
    details: string[];
    benefits: string[];
    color: string;
}> = {
    "ai-scope-analysis": {
        title: "AI Scope Analysis",
        description: "Automatically analyzes requirements against deliverables to detect scope creep before it impacts your budget.",
        icon: "Brain",
        color: "from-indigo-500 to-blue-500",
        details: [
            "Real-time requirement scanning against initial scope",
            "Automatic alerts when new tasks exceed agreed boundaries",
            "Sentiment analysis on client communications to predict scope changes",
            "Historical data comparison to estimate impact"
        ],
        benefits: [
            "Prevent unbilled work",
            "Maintain healthy profit margins",
            "Improve client transparency",
            "Data-driven negotiation"
        ]
    },
    "smart-invoicing": {
        title: "Smart Invoicing",
        description: "Turn tracked time and approved milestones into professional invoices with one click.",
        icon: "FileText",
        color: "from-purple-500 to-pink-500",
        details: [
            "Automated time tracking integration",
            "Milestone-based billing triggers",
            "Customizable invoice templates",
            "Multi-currency support"
        ],
        benefits: [
            "Get paid faster",
            "Reduce administrative overhead",
            "Eliminate billing errors",
            "Professional brand presentation"
        ]
    },
    "advanced-analytics": {
        title: "Advanced Analytics",
        description: "Visualise team velocity, burn-down charts, and project health in real-time.",
        icon: "PieChart",
        color: "from-emerald-500 to-teal-500",
        details: [
            "Real-time burn-down and burn-up charts",
            "Team velocity tracking",
            "Resource utilization heatmaps",
            "Project profitability forecasting"
        ],
        benefits: [
            "Make informed decisions",
            "Identify bottlenecks early",
            "Optimize resource allocation",
            "Predict project timelines accurately"
        ]
    },
    "unified-workspace": {
        title: "Unified Workspace",
        description: "Kanban, Gantt charts, and Documentation all living together in one seamless interface.",
        icon: "Layers",
        color: "from-orange-500 to-red-500",
        details: [
            "Integrated Kanban boards and Gantt charts",
            "Context-aware documentation",
            "Seamless file sharing and versioning",
            "Real-time collaboration tools"
        ],
        benefits: [
            "Reduce context switching",
            "Single source of truth",
            "Improved team alignment",
            "Streamlined workflow"
        ]
    }
};

export default async function FeaturePage({ params }: { params: { slug: string } }) {
    const session = await getSession();
    const { slug } = params;
    const feature = featuresData[slug];

    if (!feature) {
        notFound();
    }

    return <FeatureView feature={feature} session={session} slug={slug} />;
}
