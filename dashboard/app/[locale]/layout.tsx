import type { Metadata } from 'next';
import { Inter, Poppins, Space_Grotesk } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { TeamProvider } from '@/contexts/TeamContext';
// import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { UserProvider } from '@/hooks/useUser';
import { getSession } from '@/lib/auth';
import { getCachedUser } from '@/lib/user-cache';
import { QueryProvider } from '@/providers/QueryProvider';

import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display'
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'Project Management Dashboard',
  description: 'AI-powered project scope analysis and risk detection dashboard',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'uk' }];
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = await getMessages();

  // Preload user data on server before rendering
  const session = await getSession();
  let preloadedUser = null;
  
  if (session) {
    try {
      preloadedUser = await getCachedUser(session.userId);
    } catch (error) {
      console.error('Failed to preload user:', error);
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${spaceGrotesk.variable} font-sans glass-theme bg-background text-text-primary`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <UserProvider initialUser={preloadedUser}>
                <TeamProvider>
              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:glass-heavy focus:px-6 focus:py-3 focus:rounded-xl focus:text-text-primary focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Skip to main content
              </a>
              {/* Command Palette - Cmd/Ctrl+K */}
              <CommandPalette />
              {/* Global Keyboard Shortcuts */}
              <KeyboardShortcuts />
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
                </TeamProvider>
              </UserProvider>
            </QueryProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast-notification',
                style: {
                  maxWidth: '420px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  className: 'toast-notification toast-notification-success',
                  iconTheme: {
                    primary: 'rgb(34, 197, 94)',
                    secondary: 'rgba(255, 255, 255, 0.9)',
                  },
                },
                error: {
                  className: 'toast-notification toast-notification-error',
                  iconTheme: {
                    primary: 'rgb(239, 68, 68)',
                    secondary: 'rgba(255, 255, 255, 0.9)',
                  },
                },
                loading: {
                  className: 'toast-notification toast-notification-loading',
                  iconTheme: {
                    primary: 'rgb(128, 152, 249)',
                    secondary: 'rgba(255, 255, 255, 0.9)',
                  },
                },
              }}
            />
            <SpeedInsights />
            <Analytics />
            {/* <PerformanceMonitor /> */}
          </ThemeProvider>
        </NextIntlClientProvider>
        <Script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
