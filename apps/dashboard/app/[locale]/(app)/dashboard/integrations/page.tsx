'use client';

import { useState } from 'react';
import { Plug, Search } from 'lucide-react';
import { IntegrationCard, Integration } from '@/components/integrations/IntegrationCard';
import { IntegrationModal } from '@/components/integrations/IntegrationModal';
import toast from 'react-hot-toast';

// Mock integrations data
const INTEGRATIONS: Integration[] = [
    {
        id: 'jira',
        name: 'Jira',
        description: 'Sync tasks, issues, and project data with Atlassian Jira',
        category: 'project-management',
        icon: '🔷',
        isConnected: true,
        lastSync: '2 hours ago',
        status: 'healthy'
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Connect repositories, track commits, and manage pull requests',
        category: 'version-control',
        icon: '🐙',
        isConnected: true,
        lastSync: '30 minutes ago',
        status: 'healthy'
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send notifications and updates to your Slack workspace',
        category: 'communication',
        icon: '💬',
        isConnected: false
    },
    {
        id: 'gitlab',
        name: 'GitLab',
        description: 'Integrate with GitLab for version control and CI/CD',
        category: 'version-control',
        icon: '🦊',
        isConnected: false
    },
    {
        id: 'teams',
        name: 'Microsoft Teams',
        description: 'Collaborate and receive notifications in Microsoft Teams',
        category: 'communication',
        icon: '👥',
        isConnected: false
    },
    {
        id: 'asana',
        name: 'Asana',
        description: 'Sync tasks and projects with Asana',
        category: 'project-management',
        icon: '📋',
        isConnected: false
    },
    {
        id: 'trello',
        name: 'Trello',
        description: 'Connect Trello boards and sync cards',
        category: 'project-management',
        icon: '📊',
        isConnected: false
    },
    {
        id: 'linear',
        name: 'Linear',
        description: 'Streamline issue tracking with Linear integration',
        category: 'project-management',
        icon: '⚡',
        isConnected: false
    },
];

const CATEGORIES = [
    { id: 'all', label: 'All Integrations' },
    { id: 'project-management', label: 'Project Management' },
    { id: 'version-control', label: 'Version Control' },
    { id: 'communication', label: 'Communication' },
    { id: 'analytics', label: 'Analytics' },
];

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalIntegration, setModalIntegration] = useState<Integration | null>(null);

    const filteredIntegrations = integrations.filter(integration => {
        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
        const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleConnect = (id: string) => {
        const integration = integrations.find(i => i.id === id);
        if (integration) {
            setModalIntegration(integration);
        }
    };

    const handleConfigure = (id: string) => {
        const integration = integrations.find(i => i.id === id);
        if (integration) {
            setModalIntegration(integration);
        }
    };

    const handleDisconnect = (id: string) => {
        setIntegrations(prev => prev.map(i =>
            i.id === id ? { ...i, isConnected: false, lastSync: undefined, status: undefined } : i
        ));
        toast.success('Integration disconnected');
    };

    const handleSaveConfig = (id: string, config: any) => {
        setIntegrations(prev => prev.map(i =>
            i.id === id ? { ...i, isConnected: true, lastSync: 'Just now', status: 'healthy' } : i
        ));
        toast.success('Integration configured successfully');
    };

    const connectedCount = integrations.filter(i => i.isConnected).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <Plug className="w-7 h-7 text-primary" />
                    Integrations
                </h1>
                <p className="text-text-secondary mt-1">
                    Connect your favorite tools and streamline your workflow
                </p>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-text-tertiary">{connectedCount} Connected</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-text-tertiary">{integrations.length - connectedCount} Available</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === category.id
                                    ? 'bg-primary/20 text-primary border border-primary/40'
                                    : 'glass-light text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Integrations Grid */}
            {filteredIntegrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIntegrations.map(integration => (
                        <IntegrationCard
                            key={integration.id}
                            integration={integration}
                            onConnect={handleConnect}
                            onConfigure={handleConfigure}
                            onDisconnect={handleDisconnect}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-medium rounded-xl p-12 border border-white/10 text-center">
                    <Plug className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <p className="text-lg font-semibold text-text-primary">No integrations found</p>
                    <p className="text-sm text-text-tertiary mt-2">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}

            {/* Configuration Modal */}
            <IntegrationModal
                integration={modalIntegration}
                isOpen={!!modalIntegration}
                onClose={() => setModalIntegration(null)}
                onSave={handleSaveConfig}
            />
        </div>
    );
}
