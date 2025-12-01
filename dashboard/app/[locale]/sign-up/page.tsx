'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
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
    return (
      <EmailVerificationModal
        email={formData.email}
        onResend={handleResendVerification}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-8 overflow-y-auto">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-1/4 -left-48 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-48 w-[700px] h-[700px] bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-10">
            <Logo variant="default" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-text-secondary">Start analyzing your projects today</p>
        </div>

        {/* Sign Up Form */}
        <div className="glass-strong rounded-2xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Full Name */}
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
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
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
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                  placeholder="johndoe"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email */}
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
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
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
                  onChange={handleChange}
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
              <p className="mt-1 text-xs text-text-tertiary">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-12 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-3 rounded-xl font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* OAuth Section */}
          <div className="mt-6">
            <p className="text-center text-sm text-text-tertiary mb-4">Or continue with</p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="glass-subtle hover:glass-light border border-border rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              onClick={() => {
                const currentUrl = window.location.pathname + window.location.search;
                window.location.href = `/api/auth/oauth/google?redirect=${encodeURIComponent(currentUrl)}`;
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="glass-subtle hover:glass-light border border-border rounded-xl p-3 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              onClick={() => {
                const currentUrl = window.location.pathname + window.location.search;
                window.location.href = `/api/auth/oauth/microsoft?redirect=${encodeURIComponent(currentUrl)}`;
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M13 1h10v10H13z" />
                <path fill="#7fba00" d="M1 13h10v10H1z" />
                <path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
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

