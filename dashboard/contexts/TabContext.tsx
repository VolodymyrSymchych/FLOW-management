'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    MessageSquare,
    Receipt,
    BarChart3,
    CheckSquare,
    Clock,
    FileText,
    Users,
    Settings,
    LucideIcon
} from 'lucide-react';

export interface Tab {
    id: string;
    label: string;
    href: string;
    icon?: LucideIcon;
}

interface TabContextType {
    tabs: Tab[];
    activeTabId: string | null;
    closeTab: (id: string, e?: React.MouseEvent) => void;
    isLoading: boolean;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

// Map common paths to labels and icons
const getTabInfo = (pathname: string): { label: string; icon?: LucideIcon } => {
    if (pathname === '/dashboard') return { label: 'Overview', icon: LayoutDashboard };
    if (pathname === '/dashboard/projects') return { label: 'Projects', icon: FolderKanban };
    if (pathname === '/dashboard/chat') return { label: 'Chat', icon: MessageSquare };
    if (pathname === '/dashboard/invoices') return { label: 'Invoices', icon: Receipt };
    if (pathname === '/dashboard/charts') return { label: 'Charts', icon: BarChart3 };
    if (pathname === '/dashboard/tasks') return { label: 'Tasks', icon: CheckSquare };
    if (pathname === '/dashboard/attendance') return { label: 'Attendance', icon: Clock };
    if (pathname === '/dashboard/documentation') return { label: 'Documentation', icon: FileText };
    if (pathname === '/dashboard/team') return { label: 'Team', icon: Users };
    if (pathname === '/dashboard/settings') return { label: 'Settings', icon: Settings };

    // Dynamic routes or other pages
    if (pathname.startsWith('/dashboard/projects/')) return { label: 'Project Details', icon: FolderKanban };
    if (pathname.startsWith('/dashboard/invoices/')) return { label: 'Invoice Details', icon: Receipt };

    // Fallback
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return {
        label: lastPart ? lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ') : 'Dashboard',
        icon: undefined
    };
};

export function TabProvider({ children }: { children: ReactNode }) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    // Load tabs from localStorage
    useEffect(() => {
        try {
            const savedTabs = localStorage.getItem('app-tabs');
            if (savedTabs) {
                // Need to reconstruct icons because JSON doesn't store functions
                const parsedTabs = JSON.parse(savedTabs);
                const hydratedTabs = parsedTabs.map((t: any) => ({
                    ...t,
                    ...getTabInfo(t.href) // Re-attach icons based on href
                }));
                setTabs(hydratedTabs);
            }
        } catch (e) {
            console.error('Failed to load tabs:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save tabs to localStorage
    useEffect(() => {
        if (!isLoading) {
            const tabsToSave = tabs.map(({ icon, ...rest }) => rest);
            localStorage.setItem('app-tabs', JSON.stringify(tabsToSave));
        }
    }, [tabs, isLoading]);

    // Handle navigation
    useEffect(() => {
        if (!pathname || isLoading) return;

        // Don't add auth pages or landing pages
        const excludedPaths = ['/sign-in', '/sign-up', '/verify', '/forgot-password', '/reset-password', '/login'];
        // Check if current path matches any excluded path (with or without locale)
        const isExcluded = excludedPaths.some(p => pathname?.includes(p));

        // Also exclude exact root paths (locales) e.g., /, /en, /uk, but NOT /en/dashboard
        const isRoot = pathname === '/' || pathname === '/en' || pathname === '/uk';

        if (isExcluded || isRoot) return;

        const existingTab = tabs.find(t => t.href === pathname);

        if (existingTab) {
            setActiveTabId(existingTab.id);
        } else {
            const { label, icon } = getTabInfo(pathname);
            const newTab: Tab = {
                id: crypto.randomUUID(),
                label,
                href: pathname,
                icon
            };

            setTabs(prev => {
                // Limit max tabs to 10
                const newTabs = [...prev, newTab];
                if (newTabs.length > 10) newTabs.shift();
                return newTabs;
            });
            setActiveTabId(newTab.id);
        }
    }, [pathname, isLoading]);

    const closeTab = useCallback((id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        setTabs(prev => {
            const newTabs = prev.filter(t => t.id !== id);

            // If closing active tab, try to find another one to activate isn't strictly necessary 
            // because Next.js router handles the view, but we should make sure we don't end up 
            // on a page that isn't in tabs if we can avoid it. 
            // However, usually closing a tab implies we interpret the user wanting to leave that context,
            // but without changing current URL immediately unless we force navigation.
            // For this implementation, we just close the tab. If it was active, 
            // the user is technically still on that page until they navigate away.

            return newTabs;
        });
    }, []);

    return (
        <TabContext.Provider value={{ tabs, activeTabId, closeTab, isLoading }}>
            {children}
        </TabContext.Provider>
    );
}

export function useTabs() {
    const context = useContext(TabContext);
    if (context === undefined) {
        throw new Error('useTabs must be used within a TabProvider');
    }
    return context;
}
