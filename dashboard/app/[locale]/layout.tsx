import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import '../literal-dashboard.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { TeamProvider } from '@/contexts/TeamContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { UserProvider } from '@/hooks/useUser';
import { getSession } from '@/lib/auth';
import { getCachedUser } from '@/lib/user-cache';
import { QueryProvider } from '@/providers/QueryProvider';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
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
  const messages = await getMessages({ locale });

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
      <body
        className={`${inter.variable} font-sans bg-background text-text-primary`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
            <QueryProvider>
              <UserProvider initialUser={preloadedUser}>
                <TeamProvider>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-5 focus:py-3 focus:text-text-primary focus:shadow-floating focus:outline-none"
                  >
                    Skip to main content
                  </a>
                  <CommandPalette />
                  <KeyboardShortcuts />
                  <ConditionalLayout>{children}</ConditionalLayout>
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
                },
                error: {
                  className: 'toast-notification toast-notification-error',
                },
                loading: {
                  className: 'toast-notification toast-notification-loading',
                },
              }}
            />
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
