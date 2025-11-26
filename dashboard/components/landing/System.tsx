import React from 'react';

export function System() {
    return (
        <section className="overflow-hidden lg:py-32 bg-[#050505] w-full z-10 border-white/5 border-t my-12 pt-24 pb-24 relative">

            {/* Header */}
            <div className="w-full px-6 lg:px-12 flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 [animation:fadeSlideIn_0.8s_ease-out_0.2s_both] animate-on-scroll animate">
                <h2 className="text-5xl lg:text-7xl font-normal text-white tracking-tighter leading-[0.9] uppercase">
                    System 2.0.
                    <span className="text-neutral-500">New Logic.</span>
                </h2>

                <a href="#" className="group flex items-center gap-4 text-xs font-medium text-white hover:text-[#FACC15] transition-colors uppercase tracking-widest pb-2 border-b border-white/10 hover:border-[#FACC15]">
                    Explore Interface
                    <iconify-icon icon="solar:arrow-right-up-bold-duotone" width="12"></iconify-icon>
                </a>
            </div>

            {/* Carousel Scroll Container */}
            <div className="w-full overflow-x-auto pb-12 px-6 lg:px-12 flex gap-6 snap-x snap-mandatory scrollbar-hide [animation:fadeSlideIn_1s_ease-out_0.3s_both] animate-on-scroll animate" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>

                {/* Card 1: Liquid Interface */}
                <div className="snap-center shrink-0 w-[300px] md:w-[360px] group cursor-default">
                    <div className="aspect-[4/5] overflow-hidden transition-all duration-500 hover:border-white/20 bg-[#080808] w-full border-white/10 border relative">
                        {/* Background Abstract */}
                        <div className="opacity-20 mix-blend-screen absolute top-0 right-0 bottom-0 left-0">
                            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/92f79571-c9ab-4ba6-827b-8845c8060486_800w.webp" className="filter contrast-125 w-full h-full object-cover grayscale" alt="Abstract" />
                        </div>

                        {/* Floating UI Elements (Square) */}
                        <div className="flex flex-col gap-4 pt-8 pr-8 pb-8 pl-8 absolute top-0 right-0 bottom-0 left-0 items-center justify-center">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-white/10 transition-colors">
                                    <iconify-icon icon="solar:shield-check-bold-duotone" width="24" className="opacity-70"></iconify-icon>
                                </div>
                                <div className="w-16 h-16 bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-white/10 transition-colors">
                                    <iconify-icon icon="solar:layers-minimalistic-bold-duotone" width="24" className="opacity-70"></iconify-icon>
                                </div>
                            </div>

                            <div className="w-48 h-12 bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-between px-3 shadow-2xl z-10">
                                <div className="w-8 h-8 bg-white/10 flex items-center justify-center text-white">
                                    <iconify-icon icon="solar:moon-bold-duotone" width="16" className=""></iconify-icon>
                                </div>
                                <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider mr-auto ml-3">Analysis</span>
                                <iconify-icon icon="solar:alt-arrow-down-bold-duotone" className="text-neutral-500"></iconify-icon>
                            </div>
                        </div>

                        {/* Overlay Grid */}
                        <div className="pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z2kiPjNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] absolute top-0 right-0 bottom-0 left-0">
                        </div>
                    </div>
                    <div className="mt-6 border-l border-white/10 pl-4">
                        <h3 className="text-sm text-white font-medium uppercase tracking-widest mb-2">Liquid Interface</h3>
                        <p className="text-neutral-500 font-light text-xs leading-relaxed max-w-[90%]">
                            Refracts project data in real time. Dynamically adapting workflow.
                        </p>
                    </div>
                </div>

                {/* Card 2: Lock Screen / Device */}
                <div className="snap-center shrink-0 w-[300px] md:w-[360px] group cursor-default">
                    <div className="w-full aspect-[4/5] bg-[#080808] border border-white/10 overflow-hidden relative flex items-center justify-center transition-all duration-500 hover:border-white/20">
                        {/* Geometric Frame */}
                        <div className="w-[70%] h-[85%] border border-white/10 bg-[#030303] overflow-hidden relative shadow-2xl">
                            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3b89a5fb-be9e-41e8-8e44-6630812764c9_800w.webp" className="opacity-40 w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0 grayscale" alt="Building Render" />

                            {/* UI Overlay */}
                            <div className="absolute top-6 left-0 w-full flex flex-col items-center z-10 px-6">
                                <div className="w-full flex justify-between items-center border-b border-white/5 pb-2 mb-4">
                                    <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Site 04</span>
                                    <div className="w-1 h-1 bg-[#FACC15]"></div>
                                </div>
                                <span className="text-4xl font-light text-white tracking-tighter">09:41</span>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>
                        </div>
                    </div>
                    <div className="mt-6 border-l border-white/10 pl-4">
                        <h3 className="text-sm text-white font-medium uppercase tracking-widest mb-2">Immersive Twin</h3>
                        <p className="text-neutral-500 font-light text-xs leading-relaxed max-w-[90%]">
                            Synchronizes with physical site. Structural subject in view.
                        </p>
                    </div>
                </div>

                {/* Card 3: Notifications */}
                <div className="snap-center shrink-0 w-[300px] md:w-[360px] group cursor-default">
                    <div className="w-full aspect-[4/5] bg-[#080808] border border-white/10 overflow-hidden relative flex flex-col items-center justify-center transition-all duration-500 hover:border-white/20">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 bottom-0 left-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Notification Block */}
                        <div className="relative w-[85%] bg-[#050505] border border-white/10 p-6 shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-1">
                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#FACC15]"></div>
                                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">Active</span>
                                </div>
                                <span className="text-[10px] text-neutral-600 font-mono">02m ago</span>
                            </div>
                            <p className="text-sm text-white font-normal mb-2 tracking-tight">+1 (408) Load Shift</p>
                            <p className="text-[10px] text-neutral-500 leading-relaxed font-mono">
                                &gt; REPORTING NOMINAL STRESS LEVELS
                                &gt; SECTOR 07 OK
                                &gt; NO ANOMALIES
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 border-l border-white/10 pl-4">
                        <h3 className="text-sm text-white font-medium uppercase tracking-widest mb-2">Auto Screening</h3>
                        <p className="text-neutral-500 font-light text-xs leading-relaxed max-w-[90%]">
                            Filters noise from sensor data. Detects critical load shifts.
                        </p>
                    </div>
                </div>

                {/* Card 4: Assist Controls */}
                <div className="snap-center shrink-0 w-[300px] md:w-[360px] group cursor-default">
                    <div className="w-full aspect-[4/5] bg-[#080808] border border-white/10 overflow-hidden relative flex flex-col items-center justify-center transition-all duration-500 hover:border-white/20">

                        {/* Control Panel */}
                        <div className="relative w-full px-8">
                            <div className="text-center mb-8">
                                <h4 className="text-white font-normal uppercase tracking-widest text-xs">Remote Deploy</h4>
                                <div className="h-px w-12 bg-white/10 mx-auto my-3"></div>
                                <p className="text-[10px] text-neutral-500 font-mono">FLEET STATUS: READY</p>
                            </div>

                            <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 max-w-[200px] mx-auto">
                                {/* Btn 1 */}
                                <div className="aspect-square bg-[#050505] hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group/btn">
                                    <iconify-icon icon="solar:satellite-bold-duotone" className="text-neutral-500 group-hover/btn:text-white text-xl transition-colors"></iconify-icon>
                                    <span className="text-[9px] text-neutral-600 font-medium uppercase tracking-widest">Scan</span>
                                </div>
                                {/* Btn 2 */}
                                <div className="aspect-square bg-[#050505] hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group/btn">
                                    <iconify-icon icon="solar:videocamera-record-bold-duotone" className="text-neutral-500 group-hover/btn:text-white text-xl transition-colors"></iconify-icon>
                                    <span className="text-[9px] text-neutral-600 font-medium uppercase tracking-widest">Feed</span>
                                </div>
                                {/* Btn 3 */}
                                <div className="aspect-square bg-[#050505] hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group/btn">
                                    <iconify-icon icon="solar:menu-dots-bold-duotone" className="text-neutral-500 group-hover/btn:text-white text-xl transition-colors"></iconify-icon>
                                    <span className="text-[9px] text-neutral-600 font-medium uppercase tracking-widest">Logs</span>
                                </div>
                                {/* Btn 4 (Action) */}
                                <div className="aspect-square bg-[#050505] hover:bg-red-900/10 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group/btn">
                                    <iconify-icon icon="solar:stop-bold-duotone" className="text-neutral-500 group-hover/btn:text-red-500 text-xl transition-colors"></iconify-icon>
                                    <span className="text-[9px] text-neutral-600 group-hover/btn:text-red-500 font-medium uppercase tracking-widest">Halt</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border-l border-white/10 pl-4">
                        <h3 className="text-sm text-white font-medium uppercase tracking-widest mb-2">Site Assist</h3>
                        <p className="text-neutral-500 font-light text-xs leading-relaxed max-w-[90%]">
                            Operational continuity. Automatic robotics deployment.
                        </p>
                    </div>
                </div>

            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-12 right-6 lg:right-12 flex gap-px border border-white/10 bg-[#080808]">
                <button className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-all border-r border-white/10">
                    <iconify-icon icon="solar:arrow-left-linear" width="20"></iconify-icon>
                </button>
                <button className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                    <iconify-icon icon="solar:arrow-right-linear" width="20"></iconify-icon>
                </button>
            </div>

        </section>
    );
}
