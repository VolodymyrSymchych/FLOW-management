'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/SidebarContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages that should not have sidebar and header
  const authPages = ['/sign-in', '/sign-up', '/verify', '/forgot-password'];
  const isAuthPage = authPages.includes(pathname);

  // Public invoice pages should not have sidebar and header
  const isPublicInvoicePage = pathname?.startsWith('/invoices/public/');

  // Pages that need full screen with scroll
  const fullScreenPages = ['/timeline'];
  const isFullScreenPage = fullScreenPages.includes(pathname);

  if (isAuthPage || isPublicInvoicePage) {
    // Render without sidebar and header for auth pages and public invoice pages
    return <>{children}</>;
  }

  if (isFullScreenPage) {
    // Render with sidebar and header but without padding/overflow constraints for full screen pages
    return (
      <SidebarProvider>
        <div className="flex h-screen relative overflow-hidden w-full max-w-full">
          <Sidebar />
          <MainContent>
            <Header />
            <div className="h-full overflow-y-auto w-full max-w-full min-w-0">
              {children}
            </div>
          </MainContent>
        </div>
      </SidebarProvider>
    );
  }

  // Render with sidebar and header for all other pages
  return (
    <SidebarProvider>
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar />
        <MainContent>
          <Header />
          <div className="p-8 h-full flex flex-col overflow-y-auto min-h-0">
            {children}
          </div>
        </MainContent>
      </div>
    </SidebarProvider>
  );
}
