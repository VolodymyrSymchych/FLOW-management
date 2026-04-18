'use client';

import { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface Sprint {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'planned';
}

export interface SprintSelectorProps {
    sprints: Sprint[];
    selectedSprintId: string;
    onSelectSprint: (sprintId: string) => void;
    className?: string;
}

export function SprintSelector({
    sprints,
    selectedSprintId,
    onSelectSprint,
    className = ''
}: SprintSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedSprint = sprints.find(s => s.id === selectedSprintId);

    const getStatusColor = (status: Sprint['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'completed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'planned':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 glass-medium rounded-xl border border-white/10 hover:glass-light transition-all"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                            {selectedSprint?.name || 'Select Sprint'}
                        </p>
                        {selectedSprint && (
                            <p className="text-xs text-text-tertiary">
                                {format(parseISO(selectedSprint.startDate), 'MMM dd')} - {format(parseISO(selectedSprint.endDate), 'MMM dd, yyyy')}
                            </p>
                        )}
                    </div>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 right-0 mt-2 glass-medium rounded-xl border border-white/10 overflow-hidden z-20 shadow-xl">
                        <div className="max-h-80 overflow-y-auto">
                            {sprints.map((sprint) => (
                                <button
                                    key={sprint.id}
                                    onClick={() => {
                                        onSelectSprint(sprint.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${sprint.id === selectedSprintId ? 'bg-primary/10' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary truncate">
                                                {sprint.name}
                                            </p>
                                            <p className="text-xs text-text-tertiary mt-0.5">
                                                {format(parseISO(sprint.startDate), 'MMM dd')} - {format(parseISO(sprint.endDate), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${getStatusColor(sprint.status)}`}>
                                            {sprint.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
