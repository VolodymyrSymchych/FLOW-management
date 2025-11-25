import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, CheckCircle2, BarChart3, Clock, AlertTriangle } from "lucide-react";

const heroBg = "/assets/generated_images/abstract_project_management_interface_background.png";

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background z-10" />
                <img
                    src={heroBg}
                    alt="Abstract Project Management Background"
                    className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#d946ef]/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-[128px] animate-pulse delay-1000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
                            New: AI Scope Detection v2.0
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                            Stop Losing Revenue to <span className="text-gradient">Scope Creep</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                            AI-powered project management that helps you catch risks early, bill accurately, and deliver on time.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="glass-button px-8 py-4 rounded-full text-white font-semibold flex items-center gap-2 text-lg group">
                                Start Free Analysis
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>

                            <button className="px-8 py-4 rounded-full text-white font-medium flex items-center gap-2 hover:bg-white/5 transition-colors border border-white/10">
                                <PlayCircle className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </div>

                        <div className="mt-10 flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-800" />
                                ))}
                            </div>
                            <p>Trusted by 500+ top development teams</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        {/* Floating Glass Cards Visualization */}
                        <div className="relative w-full h-[600px]">
                            {/* Main Dashboard Card */}
                            <div className="glass-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-2xl rounded-2xl p-6 border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl z-20">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                                            <BarChart3 className="text-white w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">Project Health</h3>
                                            <p className="text-xs text-gray-400">Real-time Analysis</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                        On Track
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Scope Adherence</span>
                                            <span className="text-white font-medium">94%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[94%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-xs text-gray-400 mb-1">Velocity</p>
                                            <p className="text-xl font-bold text-white">124 SP</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-xs text-gray-400 mb-1">Risks</p>
                                            <p className="text-xl font-bold text-yellow-400">2 Low</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <p className="text-xs text-gray-400 mb-1">Budget</p>
                                            <p className="text-xl font-bold text-white">$12.4k</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Alert Card */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="glass-card absolute top-0 right-0 w-64 p-4 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl z-30"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Scope Risk Detected</p>
                                        <p className="text-xs text-gray-300 mt-1">New feature request exceeds sprint capacity by 15%.</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Success Card */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="glass-card absolute bottom-10 left-0 w-64 p-4 rounded-xl border border-green-500/30 bg-green-500/10 backdrop-blur-xl z-30"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Milestone Approved</p>
                                        <p className="text-xs text-gray-300 mt-1">Invoice #2024 generated automatically.</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative Blur Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-[80px] -z-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
