'use client';

import { useState, useEffect } from 'react';
import { User, Bell, CreditCard, Shield, Trash2, Save, Globe } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import axios from 'axios';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { SettingsSkeleton } from '@/components/skeletons';

interface UserData {
  id: number;
  email: string;
  username: string;
  fullName?: string | null;
  emailVerified: boolean;
  role: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading } = useUser();
  const router = useRouter();
  const t = useTranslations('Settings');

  // Показувати індикатор завантаження тільки якщо завантаження триває > 150ms
  const shouldShowLoading = useDelayedLoading(loading, 150);
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  const [isUpdatingLocale, setIsUpdatingLocale] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nameParts = user?.fullName?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  console.log('Settings Debug: Render', { currentLocale, selectedLocale, isSaving, isUpdatingLocale });

  const handleSaveSettings = async () => {
    console.log('Settings Debug: handleSaveSettings called', { currentLocale, selectedLocale });

    // Check if locale has changed
    if (selectedLocale === currentLocale) {
      console.log('Settings Debug: Locale unchanged, skipping save');
      return; // Nothing to save
    }

    setIsSaving(true);
    setIsUpdatingLocale(true);

    try {
      console.log('Settings Debug: Starting save...');
      // Update locale in database
      await axios.patch('/api/auth/locale', { locale: selectedLocale }, {
        withCredentials: true,
      });

      // Replace current locale in pathname with new locale
      let newPathname = pathname;
      const localePrefix = `/${currentLocale}`;

      if (pathname.startsWith(localePrefix)) {
        newPathname = pathname.replace(localePrefix, `/${selectedLocale}`);
      } else {
        // Path doesn't start with current locale (e.g. implied default en), so prepend new locale
        newPathname = `/${selectedLocale}${pathname}`;
      }

      console.log('Settings Debug:', { currentLocale, selectedLocale, pathname, newPathname });

      // Force full page reload to apply new locale
      window.location.href = newPathname;
    } catch (error) {
      console.error('Failed to update locale:', error);
      // Revert to current locale on error
      setSelectedLocale(currentLocale);
      setIsUpdatingLocale(false);
      setIsSaving(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  ];

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'billing', label: t('billing'), icon: CreditCard },
    { id: 'security', label: t('security'), icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-text-secondary mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
              ? 'border-[#8098F9] text-[#8098F9]'
              : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-medium rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            {t('profileInfo')}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  value={firstName}
                  placeholder="John"
                  disabled
                  className="w-full px-4 py-3 rounded-lg glass-input text-text-primary placeholder:text-text-tertiary opacity-75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  value={lastName}
                  placeholder="Doe"
                  disabled
                  className="w-full px-4 py-3 rounded-lg glass-input text-text-primary placeholder:text-text-tertiary opacity-75"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                placeholder="john@example.com"
                disabled
                className="w-full px-4 py-3 rounded-lg glass-input text-text-primary placeholder:text-text-tertiary opacity-75"
              />
              <div className="mt-2 flex items-center gap-2">
                {user?.emailVerified ? (
                  <span className="text-sm text-green-500">✓ {t('verified')}</span>
                ) : (
                  <span className="text-sm text-warning">⚠️ {t('notVerified')}</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                value={user?.username || ''}
                placeholder="johndoe"
                disabled
                className="w-full px-4 py-3 rounded-lg glass-input text-text-primary placeholder:text-text-tertiary opacity-75"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('bio')}
              </label>
              <textarea
                placeholder={t('bioPlaceholder')}
                rows={4}
                className="w-full px-4 py-3 rounded-lg glass-input text-text-primary placeholder:text-text-tertiary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                {t('language')}
              </label>
              <select
                data-testid="language-select"
                value={selectedLocale}
                onChange={(e) => {
                  console.log('Settings Debug: Select changed to', e.target.value);
                  setSelectedLocale(e.target.value);
                }}
                disabled={isUpdatingLocale}
                className="w-full px-4 py-3 rounded-lg glass-input text-text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[hsl(222_47%_11%)] text-text-primary">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                data-testid="save-settings-btn"
                onClick={handleSaveSettings}
                disabled={isSaving || selectedLocale === currentLocale}
                className="flex items-center space-x-2 px-6 py-3 glass-button text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('saving') : t('saveChanges')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="glass-medium rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            {t('notificationPreferences')}
          </h2>
          <div className="space-y-4">
            {[
              { label: t('emailNotifications'), description: t('emailNotificationsDesc') },
              { label: t('projectUpdates'), description: t('projectUpdatesDesc') },
              { label: t('taskAssignments'), description: t('taskAssignmentsDesc') },
              { label: t('weeklyReports'), description: t('weeklyReportsDesc') },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg glass-light"
              >
                <div>
                  <p className="font-medium text-text-primary">{item.label}</p>
                  <p className="text-sm text-text-secondary">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-white/20 text-[#8098F9] focus:ring-[#8098F9]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="glass-medium rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {t('currentPlan')}
            </h2>
            <div className="p-6 rounded-xl glass-light border border-[#8098F9]/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-1">{t('proPlan')}</h3>
                  <p className="text-text-secondary">$29{t('perMonth')}</p>
                </div>
                <button
                  onClick={() => window.location.href = '/payment'}
                  className="px-4 py-2 glass-button text-white rounded-lg transition-all font-medium"
                >
                  {t('changePlan')}
                </button>
              </div>
              <div className="space-y-2 text-sm text-text-primary">
                <p>✓ {t('unlimitedProjects')}</p>
                <p>✓ {t('unlimitedAnalyses')}</p>
                <p>✓ {t('prioritySupport')}</p>
              </div>
            </div>
          </div>

          <div className="glass-medium rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {t('paymentMethod')}
            </h2>
            <div className="p-4 rounded-lg glass-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg glass-subtle flex items-center justify-center ">
                  <CreditCard className="w-5 h-5 text-[#8098F9]" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">•••• •••• •••• 4242</p>
                  <p className="text-sm text-text-secondary">{t('expires')} 12/25</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/settings/payment-methods'}
                className="px-4 py-2 text-sm font-medium text-text-primary glass-subtle hover:glass-light rounded-lg transition-all"
              >
                {t('update')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="glass-medium rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {t('changePassword')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('currentPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg glass-input text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('newPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg glass-input text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg glass-input text-text-primary"
                />
              </div>
              <button className="px-6 py-3 glass-button text-white rounded-lg font-medium">
                {t('updatePassword')}
              </button>
            </div>
          </div>

          <div className="glass-medium rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">
              {t('dangerZone')}
            </h2>
            <div className="p-4 rounded-lg glass-light border border-red-500/20">
              <p className="text-sm text-text-primary mb-4">
                {t('deleteAccountWarning')}
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all">
                <Trash2 className="w-4 h-4" />
                <span>{t('deleteAccount')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
