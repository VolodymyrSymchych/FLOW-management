'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'expired' | 'invalid'>('verifying');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        setTimeout(() => {
          router.push(`/${locale}/sign-in`);
        }, 3000);
      } else {
        const nextStatus = String(data.error || '').toLowerCase().includes('expired') ? 'expired' : 'invalid';
        setStatus(nextStatus);
        setMessage(data.error || 'Failed to verify email');
      }
    } catch (error) {
      setStatus('invalid');
      setMessage('An error occurred while verifying your email');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      setMessage('Verification email sent. Please check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-48 w-[700px] h-[700px] bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-strong rounded-2xl p-12 border border-border text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-full glass-light flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Verifying Your Email</h2>
              <p className="text-text-secondary">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Email Verified!</h2>
              <p className="text-text-secondary mb-6">{message}</p>
              <p className="text-sm text-text-tertiary">Redirecting to sign in...</p>
              <Link
                href="/sign-in"
                className="inline-block mt-6 text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Continue to Sign In →
              </Link>
            </>
          )}

          {(status === 'expired' || status === 'invalid') && (
            <>
              <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Verification Failed</h2>
              <p className="text-text-secondary mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                {status === 'expired' && email ? (
                  <Button type="button" onClick={handleResend} loading={resending}>
                    Resend verification email
                  </Button>
                ) : (
                  <Link
                    href="/sign-up"
                    className="glass-button py-3 px-6 rounded-xl font-semibold text-white hover:scale-[1.02] transition-all inline-block"
                  >
                    Create New Account
                  </Link>
                )}
                <Link
                  href="/sign-in"
                  className="text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-medium rounded-2xl p-12 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Loading...
          </h1>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
