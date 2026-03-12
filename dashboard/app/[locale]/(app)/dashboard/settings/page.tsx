'use client';

import { useState, useEffect } from 'react';
import { User, Bell, CreditCard, Shield, Trash2, Save, Globe, Plus } from 'lucide-react';
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

type SettingPane = 'general' | 'team' | 'notifications' | 'profile' | 'billing' | 'integrations' | 'security';

const MOCK_TEAM = [
  { initials: 'MH', name: 'Markéta Horáková', email: 'marketa@pixelflow.cz', role: 'Admin' },
  { initials: 'AS', name: 'Anna Svobodová', email: 'anna@pixelflow.cz', role: 'Member' },
  { initials: 'LD', name: 'Lukáš Dvořák', email: 'lukas@pixelflow.cz', role: 'Member' },
  { initials: 'JP', name: 'Jana Procházková', email: 'jana@pixelflow.cz', role: 'Member' },
];

const MOCK_INTEGRATIONS = [
  { id: 'figma', icon: '🎨', nameKey: 'figma', descKey: 'figmaDesc', connected: true },
  { id: 'gcal', icon: '📧', nameKey: 'googleCalendar', descKey: 'googleCalendarDesc', connected: true },
  { id: 'slack', icon: '💬', nameKey: 'slack', descKey: 'slackDesc', connected: false },
  { id: 'abstract', icon: '📂', nameKey: 'abstractZeplin', descKey: 'abstractZeplinDesc', comingSoon: true },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      tabIndex={0}
      className={`stg-toggle ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
      onKeyDown={(e) => e.key === 'Enter' && onChange(!on)}
    >
      <div className="stg-tog-thumb" />
    </div>
  );
}

export default function SettingsPage() {
  const [activePane, setActivePane] = useState<SettingPane>('general');
  const { user, loading } = useUser();
  const router = useRouter();
  const t = useTranslations('Settings');
  const tCommon = useTranslations('Common');

  const shouldShowLoading = useDelayedLoading(loading, 150);
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  const [isUpdatingLocale, setIsUpdatingLocale] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [workspaceName, setWorkspaceName] = useState('Flow Studio');
  const [clientName, setClientName] = useState('');
  const [timezone, setTimezone] = useState('Europe/Kyiv');
  const [figmaOn, setFigmaOn] = useState(true);
  const [autoReviewOn, setAutoReviewOn] = useState(true);
  const [scopeGuardOn, setScopeGuardOn] = useState(true);
  const [notifTask, setNotifTask] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(true);
  const [notifScopeGuard, setNotifScopeGuard] = useState(true);

  const nameParts = user?.fullName?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  const handleSaveSettings = async () => {
    if (selectedLocale === currentLocale) return;

    setIsSaving(true);
    setIsUpdatingLocale(true);

    try {
      await axios.patch('/api/auth/locale', { locale: selectedLocale }, {
        withCredentials: true,
      });

      let newPathname = pathname;
      const localePrefix = `/${currentLocale}`;

      if (pathname.startsWith(localePrefix)) {
        newPathname = pathname.replace(localePrefix, `/${selectedLocale}`);
      } else {
        newPathname = `/${selectedLocale}${pathname}`;
      }

      window.location.href = newPathname;
    } catch (error) {
      console.error('Failed to update locale:', error);
      setSelectedLocale(currentLocale);
      setIsUpdatingLocale(false);
      setIsSaving(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  ];

  const timezones = [
    { value: 'Europe/Kyiv', label: 'Europe/Kyiv (UTC+2)' },
    { value: 'Europe/Prague', label: 'Europe/Prague (UTC+1)' },
    { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  ];

  const panes: { id: SettingPane; labelKey: string; section?: 'workspace' | 'account' }[] = [
    { id: 'general', labelKey: 'general', section: 'workspace' },
    { id: 'team', labelKey: 'teamMembers', section: 'workspace' },
    { id: 'notifications', labelKey: 'notifications', section: 'workspace' },
    { id: 'profile', labelKey: 'profile', section: 'account' },
    { id: 'billing', labelKey: 'billing', section: 'account' },
    { id: 'integrations', labelKey: 'integrations', section: 'account' },
    { id: 'security', labelKey: 'security', section: 'account' },
  ];

  if (shouldShowLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="scr-inner" data-testid="settings-screen">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>{t('title')}</h1>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{t('subtitle')}</div>
        </div>
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Settings sidebar */}
        <div style={{ width: 220, minWidth: 220, borderRight: '1px solid var(--line)', background: 'var(--white)', padding: '16px 0', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', padding: '0 14px', marginBottom: 6 }}>{t('workspace')}</div>
          {panes.filter(p => p.section === 'workspace').map((p) => (
            <div
              key={p.id}
              className={`stg-ni ${activePane === p.id ? 'on' : ''}`}
              onClick={() => setActivePane(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActivePane(p.id)}
            >
              {t(p.labelKey)}
            </div>
          ))}
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', padding: '8px 14px 6px', marginTop: 8 }}>{t('account')}</div>
          {panes.filter(p => p.section === 'account').map((p) => (
            <div
              key={p.id}
              className={`stg-ni ${activePane === p.id ? 'on' : ''}`}
              onClick={() => setActivePane(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActivePane(p.id)}
            >
              {t(p.labelKey)}
            </div>
          ))}
        </div>

        {/* Settings content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px 48px' }}>
          {activePane === 'general' && (
            <div>
              <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{t('generalSettings')}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>{t('workspaceConfig')}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>{t('workspaceIdentity')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-row">
                      <label className="form-lbl">{t('workspaceName')}</label>
                      <input className="form-inp" type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
                    </div>
                    <div className="form-row">
                      <label className="form-lbl">{t('clientName')}</label>
                      <input className="form-inp" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
                    </div>
                    <div className="form-row">
                      <label className="form-lbl">{t('timezone')}</label>
                      <select className="form-inp" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>{t('designWorkflow')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--ink)' }}>{t('figmaIntegration')}</div>
                        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{t('figmaIntegrationDesc')}</div>
                      </div>
                      <Toggle on={figmaOn} onChange={setFigmaOn} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--ink)' }}>{t('autoCreateReview')}</div>
                        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{t('autoCreateReviewDesc')}</div>
                      </div>
                      <Toggle on={autoReviewOn} onChange={setAutoReviewOn} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--ink)' }}>{t('aiScopeGuard')}</div>
                        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{t('aiScopeGuardDesc')}</div>
                      </div>
                      <Toggle on={scopeGuardOn} onChange={setScopeGuardOn} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn btn-sec">{tCommon('cancel')}</button>
                  <button type="button" className="btn btn-acc">{t('saveChanges')}</button>
                </div>
              </div>
            </div>
          )}

          {activePane === 'team' && (
            <div>
              <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{t('teamMembers')}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>{MOCK_TEAM.length} {t('members').toLowerCase()} · 1 pending invite</div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>{t('members')}</div>
                  <button type="button" className="btn btn-acc" style={{ fontSize: 13, padding: '5px 11px' }}>
                    <Plus style={{ width: 11, height: 11, display: 'inline', marginRight: 4 }} />
                    {t('inviteMember')}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {MOCK_TEAM.map((m, i) => (
                    <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < MOCK_TEAM.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#c4548e,#a03070)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 12, fontWeight: 700, color: 'white' }}>{m.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--faint)' }}>{m.email}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 11, background: m.role === 'Admin' ? 'var(--violet-bg)' : 'var(--bg2)', color: m.role === 'Admin' ? 'var(--violet)' : 'var(--muted)', padding: '2px 8px', borderRadius: 99 }}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePane === 'notifications' && (
            <div>
              <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 24 }}>{t('notifications')}</div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: t('taskAssignedToMe'), desc: t('taskAssignedDesc'), on: notifTask, set: setNotifTask },
                  { label: t('mentions'), desc: t('mentionsDesc'), on: notifMentions, set: setNotifMentions },
                  { label: t('deadlineReminders'), desc: t('deadlineRemindersDesc'), on: notifDeadline, set: setNotifDeadline },
                  { label: t('aiScopeGuardAlerts'), desc: t('aiScopeGuardAlertsDesc'), on: notifScopeGuard, set: setNotifScopeGuard },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < 3 ? 12 : 0, marginBottom: i < 3 ? 12 : 0, borderBottom: i < 3 ? '1px solid var(--line)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--ink)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <Toggle on={item.on} onChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePane === 'profile' && (
            <div>
              <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 24 }}>{t('profileInfo')}</div>
              <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)', maxWidth: 640 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#c4548e,#a03070)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'white' }}>
                      {(user?.fullName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{user?.fullName || 'User'}</div>
                      <div style={{ fontSize: 13, color: 'var(--faint)' }}>{user?.role || 'Member'} · {workspaceName}</div>
                    </div>
                    <button type="button" className="btn btn-sec" style={{ marginLeft: 'auto', fontSize: 13 }}>Change photo</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-row">
                      <label className="form-lbl">{t('firstName')}</label>
                      <input className="form-inp" type="text" value={firstName} placeholder="John" disabled />
                    </div>
                    <div className="form-row">
                      <label className="form-lbl">{t('lastName')}</label>
                      <input className="form-inp" type="text" value={lastName} placeholder="Doe" disabled />
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">{t('email')}</label>
                    <input className="form-inp" type="email" value={user?.email || ''} placeholder="john@example.com" disabled />
                    <div style={{ marginTop: 6, fontSize: 13 }}>
                      {user?.emailVerified ? (
                        <span style={{ color: 'var(--sage)' }}>✓ {t('verified')}</span>
                      ) : (
                        <span style={{ color: 'var(--amber)' }}>⚠ {t('notVerified')}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">{t('username')}</label>
                    <input className="form-inp" type="text" value={user?.username || ''} placeholder="johndoe" disabled />
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">{t('bio')}</label>
                    <textarea className="form-ta" name="bio" placeholder={t('bioPlaceholder')} rows={4} />
                  </div>
                  <div className="form-row">
                    <label className="form-lbl"><Globe style={{ width: 12, height: 12, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />{t('language')}</label>
                    <select
                      data-testid="language-select"
                      className="form-inp"
                      value={selectedLocale}
                      onChange={(e) => setSelectedLocale(e.target.value)}
                      disabled={isUpdatingLocale}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      data-testid="save-settings-btn"
                      type="button"
                      className="btn btn-acc"
                      onClick={handleSaveSettings}
                      disabled={isSaving || selectedLocale === currentLocale}
                    >
                      <Save style={{ width: 14, height: 14 }} />
                      {isSaving ? t('saving') : t('saveChanges')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePane === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
              <div style={{ background: 'linear-gradient(135deg,#c4548e,#a03070)', borderRadius: 12, padding: 20, color: 'white', marginBottom: 0 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4, fontFamily: 'var(--font-inter), Inter, sans-serif', letterSpacing: '.08em' }}>{t('currentPlanLabel')}</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Pro · €29{t('perMonth')}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{t('nextBilling')} Mar 28, 2026 · 5 {t('seats')}</div>
              </div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, padding: 16, fontSize: 14, color: 'var(--muted)' }}>{t('invoicesNote')} Contact support@flow.example.com</div>

              <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)' }}>
                <h2 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>{t('paymentMethod')}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--violet-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard style={{ width: 20, height: 20, color: 'var(--violet)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>•••• •••• •••• 4242</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{t('expires')} 12/25</div>
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => router.push('/dashboard/settings/payment-methods')}>
                    {t('update')}
                  </button>
                </div>
              </div>
              <button type="button" className="btn btn-acc" onClick={() => router.push('/dashboard/payment')}>
                {t('changePlan')}
              </button>
            </div>
          )}

          {activePane === 'integrations' && (
            <div>
              <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 24 }}>{t('integrations')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MOCK_INTEGRATIONS.map((int) => (
                  <div key={int.id} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0ebfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{int.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{t(int.nameKey)}</div>
                      <div style={{ fontSize: 12, color: 'var(--faint)' }}>{t(int.descKey)}</div>
                    </div>
                    {int.comingSoon ? (
                      <button type="button" className="btn btn-sec" style={{ fontSize: 12, padding: '4px 10px' }}>{t('comingSoon')}</button>
                    ) : int.connected ? (
                      <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 11, background: 'var(--sage-bg)', color: 'var(--sage)', padding: '2px 8px', borderRadius: 99 }}>{t('connected')}</span>
                    ) : (
                      <button type="button" className="btn btn-acc" style={{ fontSize: 12, padding: '4px 10px' }}>{t('connect')}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePane === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
              <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)' }}>
                <h2 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>{t('changePassword')}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row">
                    <label className="form-lbl">{t('currentPassword')}</label>
                    <input className="form-inp" type="password" />
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">{t('newPassword')}</label>
                    <input className="form-inp" type="password" />
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">{t('confirmPassword')}</label>
                    <input className="form-inp" type="password" />
                  </div>
                  <button type="button" className="btn btn-acc" style={{ alignSelf: 'flex-start' }}>
                    {t('updatePassword')}
                  </button>
                </div>
              </div>

              <div className="surface-panel" style={{ borderRadius: 12, padding: 24, border: '1px solid var(--line)' }}>
                <h2 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 18, fontWeight: 600, color: 'var(--red)', marginBottom: 16 }}>{t('dangerZone')}</h2>
                <div style={{ padding: 16, background: 'var(--red-bg)', border: '1px solid rgba(184, 50, 50, 0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 16, lineHeight: 1.5 }}>{t('deleteAccountWarning')}</p>
                  <button type="button" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--red)', color: '#fff', border: 'none' }}>
                    <Trash2 style={{ width: 16, height: 16 }} />
                    {t('deleteAccount')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
