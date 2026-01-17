'use client';

import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Integration } from './IntegrationCard';

export interface IntegrationModalProps {
    integration: Integration | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, config: any) => void;
}

export function IntegrationModal({
    integration,
    isOpen,
    onClose,
    onSave
}: IntegrationModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [syncFrequency, setSyncFrequency] = useState('15');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

    if (!isOpen || !integration) return null;

    const handleTest = async () => {
        setIsTesting(true);
        // Simulate API test
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTestResult('success');
        setIsTesting(false);
    };

    const handleSave = () => {
        onSave(integration.id, {
            apiKey,
            webhookUrl,
            syncFrequency: parseInt(syncFrequency)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl glass-medium rounded-2xl border border-white/10 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">
                            Configure {integration.name}
                        </h2>
                        <p className="text-sm text-text-tertiary mt-1">
                            Set up your integration settings
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            API Key / Token
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Webhook URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://your-webhook-url.com"
                            className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Sync Frequency (minutes)
                        </label>
                        <select
                            value={syncFrequency}
                            onChange={(e) => setSyncFrequency(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="5">Every 5 minutes</option>
                            <option value="15">Every 15 minutes</option>
                            <option value="30">Every 30 minutes</option>
                            <option value="60">Every hour</option>
                        </select>
                    </div>
                </div>

                {/* Test Connection */}
                <div className="mb-6">
                    <button
                        onClick={handleTest}
                        disabled={!apiKey || isTesting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg glass-light hover:glass-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTesting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Testing Connection...
                            </>
                        ) : (
                            'Test Connection'
                        )}
                    </button>

                    {testResult && (
                        <div className={`mt-3 flex items-center gap-2 text-sm ${testResult === 'success' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {testResult === 'success' ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Connection successful!
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4" />
                                    Connection failed. Please check your credentials.
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!apiKey}
                        className="px-6 py-2 text-sm font-semibold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
