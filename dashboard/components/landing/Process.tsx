import React from 'react';

export function Process() {
    return (
        <section className="w-full bg-[#050505] relative py-24 lg:py-32 border-t border-white/5 overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }}
            >
            </div>

            <div className="w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center relative z-10">

                {/* Left: Isometric Process Visualization */}
                <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none flex items-center justify-center [animation:fadeSlideIn_0.8s_ease-out_0.2s_both] animate-on-scroll animate">

                    {/* Isometric Stack Container */}
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                        {/* Layer 04 (Bottom) */}
                        <div className="absolute inset-0 z-0 translate-y-24 transition-transform duration-700 hover:translate-y-28 group">
                            <div className="w-full h-full border border-white/10 bg-white/[0.02] backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-colors group-hover:border-[#FACC15]/30"></div>
                            {/* Label Right */}
                            <div className="absolute top-1/2 -right-12 sm:-right-24 -translate-y-1/2 translate-x-4 flex items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500 delay-300">
                                <div className="px-3 py-1.5 rounded-full border border-white/10 bg-[#080808] flex items-center gap-2 shadow-xl">
                                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">04. Fabricate</span>
                                    <div className="w-8 h-4 bg-neutral-800 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 bottom-0.5 w-3 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="w-12 h-[1px] bg-white/10 origin-left -rotate-[25deg]"></div>
                            </div>
                        </div>

                        {/* Layer 03 */}
                        <div className="absolute inset-0 z-10 translate-y-12 transition-transform duration-700 hover:translate-y-14 group">
                            <div className="w-full h-full border border-white/10 bg-white/[0.04] backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-colors group-hover:border-[#FACC15]/30"></div>
                            {/* Label Left */}
                            <div className="absolute top-1/2 -left-12 sm:-left-24 -translate-y-1/2 -translate-x-4 flex flex-row-reverse items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500 delay-200">
                                <div className="px-3 py-1.5 rounded-full border border-white/10 bg-[#080808] flex items-center gap-2 shadow-xl">
                                    <div className="w-8 h-4 bg-neutral-800 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 bottom-0.5 w-3 bg-white/20 rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">03. Engineer</span>
                                </div>
                                <div className="w-12 h-[1px] bg-white/10 origin-right rotate-[25deg]"></div>
                            </div>
                        </div>

                        {/* Layer 02 */}
                        <div className="absolute inset-0 z-20 translate-y-0 transition-transform duration-700 hover:-translate-y-2 group">
                            <div className="w-full h-full border border-white/10 bg-white/[0.06] backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-colors group-hover:border-[#FACC15]/30"></div>
                            {/* Label Right */}
                            <div className="absolute top-1/2 -right-12 sm:-right-24 -translate-y-1/2 translate-x-4 flex items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500 delay-100">
                                <div className="px-3 flex items-center gap-2 shadow-xl">
                                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">02. Simulate</span>
                                    <div className="w-8 h-4 bg-[#FACC15] rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 bottom-0.5 w-3 bg-black rounded-full"></div>
                                    </div>
                                </div>
                                <div className="w-12 h-[1px] bg-white/10 origin-left -rotate-[25deg]"></div>
                            </div>
                        </div>

                        {/* Layer 01 (Top) */}
                        <div className="absolute inset-0 z-30 -translate-y-12 transition-transform duration-700 hover:-translate-y-16 group">
                            <div className="w-full h-full border border-white/10 bg-white/[0.08] backdrop-blur-[2px] rotate-45 scale-y-50 shadow-2xl transition-colors group-hover:border-[#FACC15]/50 hover:bg-white/10"></div>
                            {/* Label Left */}
                            <div className="absolute top-1/2 -left-12 sm:-left-24 -translate-y-1/2 -translate-x-4 flex flex-row-reverse items-center gap-3 opacity-0 lg:opacity-100 transition-opacity duration-500">
                                <div className="px-3 py-1.5 rounded-full border border-white/10 bg-[#080808] flex items-center gap-2 shadow-xl">
                                    <div className="w-8 h-4 bg-[#FACC15] rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 bottom-0.5 w-3 bg-black rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">01. Analyze</span>
                                </div>
                                <div className="w-12 h-[1px] bg-white/10 origin-right rotate-[25deg]"></div>
                            </div>
                        </div>

                        {/* Connecting dashed line through center */}
                        <div className="absolute left-1/2 top-[-20%] bottom-[-20%] w-px border-l border-dashed border-white/20 -translate-x-1/2 z-[-1]"></div>
                    </div>
                </div>

                {/* Right: Content Steps */}
                <div className="flex flex-col justify-center [animation:fadeSlideIn_0.8s_ease-out_0.4s_both] animate-on-scroll animate">
                    <h2 className="text-4xl lg:text-6xl font-light text-white tracking-tight leading-[1.1] mb-6">
                        From Algorithm
                        <span className="text-neutral-500">to Artifact</span>
                    </h2>

                    <p className="text-lg text-neutral-400 leading-relaxed mb-16 max-w-md font-light">
                        We strip away the unnecessary, focusing on structural purity and parametric efficiency to deliver timeless monuments.
                    </p>

                    {/* Steps List */}
                    <div className="relative space-y-12 pl-2">
                        {/* Vertical Connector Line */}
                        <div className="bg-gradient-to-b from-[#FACC15] via-white/10 to-transparent opacity-30 w-[1px] absolute top-4 bottom-4 left-[27px]"></div>

                        {/* Step 1 */}
                        <div className="relative flex gap-8 group cursor-default">
                            <div className="relative z-10 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#080808] border border-white/10 flex items-center justify-center group-hover:border-[#FACC15] group-hover:text-[#FACC15] transition-all duration-300">
                                    <iconify-icon icon="solar:magnifer-bold-duotone" width="20"></iconify-icon>
                                </div>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-xl text-white font-normal mb-2 group-hover:text-[#FACC15] transition-colors">Site &amp; Context Analysis</h3>
                                <p className="text-neutral-500 font-light leading-relaxed">
                                    We decode the genius loci, analyzing environmental data and urban flows to establish the project&apos;s constraints.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex gap-8 group cursor-default">
                            <div className="relative z-10 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#080808] border border-white/10 flex items-center justify-center group-hover:border-[#FACC15] group-hover:text-[#FACC15] transition-all duration-300">
                                    <iconify-icon icon="solar:layers-minimalistic-bold-duotone" width="20"></iconify-icon>
                                </div>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-xl text-white font-normal mb-2 group-hover:text-[#FACC15] transition-colors">Parametric Synthesis</h3>
                                <p className="text-neutral-500 font-light leading-relaxed">
                                    Algorithms generate optimized form factors, balancing structural integrity with our brutalist aesthetic code.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex gap-8 group cursor-default">
                            <div className="relative z-10 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#080808] border border-white/10 flex items-center justify-center group-hover:border-[#FACC15] group-hover:text-[#FACC15] transition-all duration-300">
                                    <iconify-icon icon="solar:ruler-pen-bold-duotone" width="20"></iconify-icon>
                                </div>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-xl text-white font-normal mb-2 group-hover:text-[#FACC15] transition-colors">BIM Integration</h3>
                                <p className="text-neutral-500 font-light leading-relaxed">
                                    Every joint and surface is modeled with sub-millimeter precision, ensuring the digital vision translates perfectly.
                                </p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex gap-8 group cursor-default">
                            <div className="relative z-10 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#080808] border border-white/10 flex items-center justify-center group-hover:border-[#FACC15] group-hover:text-[#FACC15] transition-all duration-300">
                                    <iconify-icon icon="solar:buildings-bold-duotone" width="20"></iconify-icon>
                                </div>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-xl text-white font-normal mb-2 group-hover:text-[#FACC15] transition-colors">Robotic Fabrication</h3>
                                <p className="text-neutral-500 font-light leading-relaxed">
                                    Automated construction methods realize the design, turning digital void into concrete matter.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Technology Stack Logos (Monotone) */}
                    <div className="mt-16 pt-10 border-t border-white/5">
                        <p className="text-xs uppercase tracking-widest text-neutral-600 mb-6">Powered by</p>
                        <div className="flex flex-wrap gap-8 items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <iconify-icon icon="simple-icons:autodesk" width="24" className="hover:text-white transition-colors"></iconify-icon>
                            <iconify-icon icon="simple-icons:rhinoceros" width="28" className="hover:text-white transition-colors"></iconify-icon>
                            <iconify-icon icon="simple-icons:unrealengine" width="24" className="hover:text-white transition-colors"></iconify-icon>
                            <iconify-icon icon="simple-icons:blender" width="24" className="hover:text-white transition-colors"></iconify-icon>
                            <iconify-icon icon="cib:adobe-creative-cloud" width="26" className="hover:text-white transition-colors"></iconify-icon>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
