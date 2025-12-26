'use client';

import { motion } from 'framer-motion';
import { Brain, Layout, Receipt, BarChart3 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

const features = [
    {
        title: "AI Scope Analysis",
        description: "Detect scope creep automatically. Our AI analyzes your project requirements against actual deliverables.",
        icon: Brain,
        className: "md:col-span-2 md:row-span-2",
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        title: "Smart Invoicing",
        description: "Generate invoices based on tracked time and approved milestones instantly.",
        icon: Receipt,
        className: "md:col-span-1 md:row-span-1",
        color: "text-green-400",
        bg: "bg-green-500/10"
    },
    {
        title: "Advanced Analytics",
        description: "Visualize team velocity, burn-down charts, and project health in real-time.",
        icon: BarChart3,
        className: "md:col-span-1 md:row-span-1",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        title: "Unified Workspace",
        description: "Kanban, Gantt, and Documentation all in one seamless interface.",
        icon: Layout,
        className: "md:col-span-2 md:row-span-1",
        color: "text-pink-400",
        bg: "bg-pink-500/10"
    }
];

const Features = memo(function Features() {
    const [isHydrated, setIsHydrated] = useState(typeof window !== 'undefined');
    
    // #region agent log
    useEffect(() => {
        if (!isHydrated) {
            setIsHydrated(true);
        }
        fetch('http://127.0.0.1:7242/ingest/0e0dbcba-8565-423c-afc9-9ff8dcbd2ea3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Features.tsx:47',message:'Features hydrated (FIXED)',data:{isHydrated:true,wasAlreadyHydrated:isHydrated},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'F'})}).catch(()=>{});
    }, [isHydrated]);
    
    fetch('http://127.0.0.1:7242/ingest/0e0dbcba-8565-423c-afc9-9ff8dcbd2ea3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Features.tsx:50',message:'Features component rendered (FIXED)',data:{featuresCount:features.length,isHydrated},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Everything you need to ship <br />
                        <span className="text-primary">without the chaos</span>
                    </h2>
                    <p className="text-text-secondary">
                        Powerful features designed for modern software teams who want to focus on building, not managing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isHydrated ? { opacity: 1, y: 0 } : {}}
                            whileInView={isHydrated ? { opacity: 1, y: 0 } : {}}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: isHydrated ? index * 0.1 : 0, ease: "easeOut" }}
                            className={`group relative overflow-hidden rounded-2xl glass-medium border border-white/10 p-8 hover:bg-white/5 transition-colors ${feature.className}`}
                        >
                            <div className={`absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity ${feature.bg}`} />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className={`p-3 rounded-xl w-fit mb-6 ${feature.bg} ${feature.color}`}>
                                    {/* #region agent log */}
                                    {(() => {
                                        fetch('http://127.0.0.1:7242/ingest/0e0dbcba-8565-423c-afc9-9ff8dcbd2ea3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Features.tsx:78',message:'feature icon rendering (FIXED)',data:{featureTitle:feature.title,iconName:feature.icon.name,isHydrated},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'I'})}).catch(()=>{});
                                        return null;
                                    })()}
                                    {/* #endregion */}
                                    <feature.icon 
                                        className="w-6 h-6"
                                        style={{ 
                                            // Ensure consistent rendering
                                            opacity: 1,
                                            transform: 'translateZ(0)',
                                            backfaceVisibility: 'hidden'
                                        }}
                                    />
                                </div>

                                <h3 className="text-xl font-bold text-text-primary mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

export { Features };
