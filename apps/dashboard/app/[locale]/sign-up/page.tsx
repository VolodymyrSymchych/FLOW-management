'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Info, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

type SignUpStep = 1 | 2 | 3;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: 'Weak', tone: 'bg-danger' };
  if (score <= 3) return { score, label: 'Good', tone: 'bg-warning' };
  return { score, label: 'Strong', tone: 'bg-success' };
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<SignUpStep>(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
  });
  const [oauthData, setOauthData] = useState<{
    provider?: string;
    providerId?: string;
    avatarUrl?: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const fullName = searchParams.get('fullName');
    const provider = searchParams.get('provider');
    const providerId = searchParams.get('providerId');
    const avatarUrl = searchParams.get('avatarUrl');

    if (email) {
      setFormData((prev) => ({
        ...prev,
        email,
        fullName: fullName || prev.fullName,
        username: email.split('@')[0] || prev.username,
      }));
      setStep(2);
    }

    if (provider && providerId) {
      setOauthData({ provider, providerId, avatarUrl: avatarUrl || undefined });
    }
  }, [searchParams]);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleNext = () => {
    if (step === 1 && !formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (step === 2) {
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    setStep((prev) => Math.min(3, prev + 1) as SignUpStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username || formData.email.split('@')[0],
          password: formData.password,
          fullName: formData.fullName,
          ...(oauthData && {
            provider: oauthData.provider,
            providerId: oauthData.providerId,
            avatarUrl: oauthData.avatarUrl,
            emailVerified: true,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to resend verification email');
    }
  };

  if (success) {
    return <EmailVerificationModal email={formData.email} onResend={handleResendVerification} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-8 overflow-y-auto">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-48 w-[700px] h-[700px] bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-10">
            <Logo variant="default" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-text-secondary">Step {step} of 3</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger" aria-live="polite">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            ) : null}

            {oauthData ? (
              <div className="flex items-start gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20 text-text-primary">
                <Info className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Continuing as {formData.email}
                  </p>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                    onClick={() => {
                      setOauthData(null);
                      setFormData((prev) => ({ ...prev, email: '', fullName: '', username: '' }));
                      setStep(1);
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-primary' : 'bg-surface-muted'}`}
                />
              ))}
            </div>

            {step === 1 ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="glass-input w-full pl-12 pr-12 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">Password strength</span>
                      <span className="font-medium text-text-secondary">{passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1.5 rounded-full ${
                            bar < Math.max(1, Math.ceil(passwordStrength.score / 2))
                              ? passwordStrength.tone
                              : 'bg-surface-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Add a number and a symbol. Use at least 8 characters.
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                    placeholder={formData.email.split('@')[0] || 'johndoe'}
                    autoComplete="username"
                  />
                </div>
                <p className="mt-2 text-xs text-text-tertiary">Optional. We’ll use your email prefix if you leave this blank.</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 1 ? (
                <Button type="button" variant="ghost" tone="neutral" onClick={() => setStep((prev) => (prev - 1) as SignUpStep)}>
                  Back
                </Button>
              ) : <span />}

              {step < 3 ? (
                <Button type="button" onClick={handleNext} icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                  Continue
                </Button>
              ) : (
                <Button type="submit" loading={loading}>
                  Create account
                </Button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-text-secondary">Loading...</div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
