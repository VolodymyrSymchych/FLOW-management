'use client';

import { useState } from 'react';
import { Plug, Settings, Check, X, Clock } from 'lucide-react';

export interface Integration {
    id: string;
    name: string;
    description: string;
    category: 'project-management' | 'version-control' | 'communication' | 'analytics';
    icon: string;
    isConnected: boolean;
    lastSync?: string;
    status?: 'healthy' | 'warning' | 'error';
}

export interface IntegrationCardProps {
    integration: Integration;
    onConnect: (id: string) => void;
    onConfigure: (id: string) => void;
    onDisconnect: (id: string) => void;
}

export function IntegrationCard({
    integration,
    onConnect,
    onConfigure,
    onDisconnect
}: IntegrationCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusColor = () => {
        if (!integration.isConnected) return '';
        switch (integration.status) {
            case 'healthy':
                return 'border-green-500/30 bg-green-500/5';
            case 'warning':
                return 'border-yellow-500/30 bg-yellow-500/5';
            case 'error':
                return 'border-red-500/30 bg-red-500/5';
            default:
                return '';
        }
    };

    const getStatusIcon = () => {
        if (!integration.isConnected) return null;
        switch (integration.status) {
            case 'healthy':
                return <Check className="w-4 h-4 text-green-400" />;
            case 'warning':
                return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'error':
                return <X className="w-4 h-4 text-red-400" />;
        }
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`glass-medium rounded-xl p-6 border transition-all duration-200 hover:glass-light hover:scale-[1.02] ${integration.isConnected ? getStatusColor() : 'border-white/10'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                        {integration.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{integration.name}</h3>
                        {integration.isConnected && integration.lastSync && (
                            <p className="text-xs text-text-tertiary mt-0.5">
                                Last sync: {integration.lastSync}
                            </p>
                        )}
                    </div>
                </div>
                {integration.isConnected && (
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                    </div>
                )}
            </div>

            <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                {integration.description}
            </p>

            <div className="flex items-center gap-2">
                {integration.isConnected ? (
                    <>
                        <button
                            onClick={() => onConfigure(integration.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg glass-light hover:glass-medium transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Configure
                        </button>
                        <button
                            onClick={() => onDisconnect(integration.id)}
                            className="px-4 py-2 text-sm font-semibold rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onConnect(integration.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                        <Plug className="w-4 h-4" />
                        Connect
                    </button>
                )}
            </div>
        </div>
    );
}
