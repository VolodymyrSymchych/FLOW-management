'use client';

import React, { useState } from 'react';

export function SystemProcess() {
    const [activeLayer, setActiveLayer] = useState<'plan' | 'build' | 'track' | 'deploy'>('plan');

    return (
        <div className="overflow-hidden py-24 lg:py-32 relative bg-gradient-to-b from-black/20 via-black/15 to-black/10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/3 to-transparent opacity-20"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none flex items-center justify-center">
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                            {/* DEPLOY - найнижчий шар, тег справа на рівні нижнього правого кута */}
                            <div className="absolute inset-0 z-0 translate-y-24 transition-transform duration-700 hover:translate-y-28 group">
                                <div className="w-full h-full border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-all duration-500 group-hover:border-emerald-500/30"></div>
                                <div className="absolute top-1/2 -right-16 sm:-right-28 translate-y-0 flex flex-row-reverse items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500 delay-300">
                                    <div className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-black/90 backdrop-blur-sm flex items-center gap-2 shadow-xl cursor-pointer" onClick={() => setActiveLayer('deploy')}>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-emerald-300 uppercase tracking-wider">Deploy</span>
                                    </div>
                                    <div className="w-16 h-[1px] bg-emerald-500/30"></div>
                                </div>
                            </div>

                            {/* TRACK - другий знизу, тег зліва на рівні нижнього лівого кута */}
                            <div className="absolute inset-0 z-10 translate-y-12 transition-transform duration-700 hover:translate-y-14 group">
                                <div className="w-full h-full border border-amber-500/20 bg-gradient-to-br from-amber-500/15 to-amber-500/5 backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-all duration-500 group-hover:border-amber-500/30"></div>
                                <div className="absolute top-1/2 -left-16 sm:-left-28 translate-y-0 flex items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500 delay-200">
                                    <div className="px-3 py-1.5 rounded-full border border-amber-500/20 bg-black/90 backdrop-blur-sm flex items-center gap-2 shadow-xl cursor-pointer" onClick={() => setActiveLayer('track')}>
                                        <span className="text-sm font-medium text-amber-300 uppercase tracking-wider">Track</span>
                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    </div>
                                    <div className="w-16 h-[1px] bg-amber-500/30"></div>
                                </div>
                            </div>

                            {/* BUILD - третій знизу, тег справа на рівні нижнього правого кута */}
                            <div className="absolute inset-0 z-20 translate-y-0 transition-transform duration-700 hover:-translate-y-2 group">
                                <div className="w-full h-full border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-blue-500/5 backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-all duration-500 group-hover:border-blue-500/30"></div>
                                <div className="absolute top-1/2 -right-16 sm:-right-28 translate-y-0 flex flex-row-reverse items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500 delay-100">
                                    <div className="px-3 py-1.5 rounded-full border border-blue-500/20 bg-black/90 backdrop-blur-sm flex items-center gap-2 shadow-xl cursor-pointer" onClick={() => setActiveLayer('build')}>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-blue-300 uppercase tracking-wider">Build</span>
                                    </div>
                                    <div className="w-16 h-[1px] bg-blue-500/30"></div>
                                </div>
                            </div>

                            {/* PLAN - верхній шар, тег зліва на рівні нижнього лівого кута */}
                            <div className="absolute inset-0 z-30 -translate-y-12 transition-transform duration-700 hover:-translate-y-16 group">
                                <div className="w-full h-full border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-purple-500/5 backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-all duration-500 group-hover:border-purple-500/30"></div>
                                <div className="absolute top-1/2 -left-16 sm:-left-28 translate-y-0 flex items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500">
                                    <div className="px-3 py-1.5 rounded-full border border-purple-500/20 bg-black/90 backdrop-blur-sm flex items-center gap-2 shadow-xl cursor-pointer" onClick={() => setActiveLayer('plan')}>
                                        <span className="text-sm font-medium text-purple-300 uppercase tracking-wider">Plan</span>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    </div>
                                    <div className="w-16 h-[1px] bg-purple-500/30"></div>
                                </div>
                            </div>

                            <div className="absolute left-1/2 top-[-20%] bottom-[-20%] w-px border-l border-dashed border-white/15 -translate-x-1/2 z-[-1]"></div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6 w-fit">
                            Our Process
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                            From Idea to Impact
                            <br />
                            <span className="text-gradient">Without the Chaos</span>
                        </h2>

                        <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-lg">
                            Our streamlined workflow helps you ship faster, track progress effortlessly, and deliver projects that exceed expectations.
                        </p>

                        <div className="relative space-y-8">
                            <div className="bg-gradient-to-b from-indigo-500 via-purple-500/20 to-transparent w-[1px] absolute top-4 bottom-4 left-[19px]"></div>

                            <div className="relative flex gap-6 group cursor-default">
                                <div className="relative z-10 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-black/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500 group-hover:text-indigo-300 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                                        <iconify-icon icon="solar:clipboard-list-bold-duotone" width="20"></iconify-icon>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg text-white font-semibold mb-1.5 group-hover:text-indigo-300 transition-colors">Plan Your Project</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Define requirements, break down tasks, and set clear milestones for your team.
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex gap-6 group cursor-default">
                                <div className="relative z-10 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-black/50 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:border-purple-500 group-hover:text-purple-300 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                                        <iconify-icon icon="solar:code-square-bold-duotone" width="20"></iconify-icon>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg text-white font-semibold mb-1.5 group-hover:text-purple-300 transition-colors">Build with Confidence</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Execute tasks efficiently with real-time collaboration and version control.
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex gap-6 group cursor-default">
                                <div className="relative z-10 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-black/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500 group-hover:text-indigo-300 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                                        <iconify-icon icon="solar:graph-new-bold-duotone" width="20"></iconify-icon>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg text-white font-semibold mb-1.5 group-hover:text-indigo-300 transition-colors">Track Progress</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Monitor velocity, spot risks early, and keep stakeholders in the loop.
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex gap-6 group cursor-default">
                                <div className="relative z-10 shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-black/50 border border-green-500/30 flex items-center justify-center text-green-400 group-hover:border-green-500 group-hover:text-green-300 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                                        <iconify-icon icon="solar:rocket-bold-duotone" width="20"></iconify-icon>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg text-white font-semibold mb-1.5 group-hover:text-green-300 transition-colors">Deploy & Invoice</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        Ship on time, generate invoices automatically, and celebrate success.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">Integrations</p>
                            <div className="flex flex-wrap gap-8 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <iconify-icon icon="logos:github-icon" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:gitlab" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:slack-icon" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:jira" width="28" className="hover:opacity-100 transition-opacity"></iconify-icon>
                                <iconify-icon icon="logos:google-icon" width="26" className="hover:opacity-100 transition-opacity"></iconify-icon>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
