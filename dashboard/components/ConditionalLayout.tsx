'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/SidebarContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages that should not have sidebar and header
  const authPages = ['/sign-in', '/sign-up', '/verify', '/forgot-password', '/login'];
  const isAuthPage = authPages.includes(pathname);

  // Landing page should not have sidebar and header
  const isLandingPage = pathname === '/';

  // Public invoice pages should not have sidebar and header
  const isPublicInvoicePage = pathname?.startsWith('/invoices/public/');

  // Pages that need full screen with scroll
  const fullScreenPages = ['/timeline'];
  const isFullScreenPage = fullScreenPages.includes(pathname);

  if (isAuthPage || isPublicInvoicePage || isLandingPage) {
    // Render without sidebar and header for auth pages, landing page, and public invoice pages
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  if (isFullScreenPage) {
    // Render with sidebar and header but without padding/overflow constraints for full screen pages
    return (
      <ErrorBoundary>
        <SidebarProvider>
          <div className="flex h-screen relative overflow-hidden w-full max-w-full">
            <Sidebar />
            <MainContent>
              <Header />
              <div id="main-content" className="h-full overflow-y-auto w-full max-w-full min-w-0" role="main" aria-label="Main content">
                {children}
              </div>
            </MainContent>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    );
  }

  // Render with sidebar and header for all other pages
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="flex h-screen relative overflow-hidden">
          <Sidebar />
          <MainContent>
            <Header />
            <div id="main-content" className="p-8 h-full flex flex-col overflow-y-auto min-h-0" role="main" aria-label="Main content">
              {children}
            </div>
          </MainContent>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
