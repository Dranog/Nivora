// path: src/app/admin/settings/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Image as ImageIcon, Loader2, Shield, Palette, Mail } from 'lucide-react';

type Settings = {
  siteName: string;
  supportEmail: string;
  minPasswordLength: number;
  platformFeePct: number;
  enableRegistrations: boolean;
  defaultRole: 'User' | 'Creator';
  defaultUserAvatar: string;

  enforceAdmin2FA: boolean;
  lockoutThreshold: number;
  lockoutWindowMin: number;
  lockoutDurationMin: number;

  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;

  sendgridEnabled: boolean;
  sendgridFromEmail: string;
};

const DEFAULTS: Settings = {
  siteName: 'Oliver Platform',
  supportEmail: 'support@oliver.app',
  minPasswordLength: 12,
  platformFeePct: 10,
  enableRegistrations: true,
  defaultRole: 'User',
  defaultUserAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',

  enforceAdmin2FA: true,
  lockoutThreshold: 5,
  lockoutWindowMin: 15,
  lockoutDurationMin: 30,

  primaryColor: '#00B8A9',
  logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Oliver',
  faviconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Favicon',

  sendgridEnabled: false,
  sendgridFromEmail: 'no-reply@oliver.app',
};

export default function SettingsPage() {
  const t = useTranslations('admin.settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core
  const [siteName, setSiteName] = useState(DEFAULTS.siteName);
  const [supportEmail, setSupportEmail] = useState(DEFAULTS.supportEmail);
  const [minPasswordLength, setMinPasswordLength] = useState<number>(DEFAULTS.minPasswordLength);
  const [platformFeePct, setPlatformFeePct] = useState<number>(DEFAULTS.platformFeePct);
  const [enableRegistrations, setEnableRegistrations] = useState<boolean>(DEFAULTS.enableRegistrations);
  const [defaultRole, setDefaultRole] = useState<'User' | 'Creator'>(DEFAULTS.defaultRole);
  const [defaultUserAvatar, setDefaultUserAvatar] = useState<string>(DEFAULTS.defaultUserAvatar);

  // Security
  const [enforceAdmin2FA, setEnforceAdmin2FA] = useState<boolean>(DEFAULTS.enforceAdmin2FA);
  const [lockoutThreshold, setLockoutThreshold] = useState<number>(DEFAULTS.lockoutThreshold);
  const [lockoutWindowMin, setLockoutWindowMin] = useState<number>(DEFAULTS.lockoutWindowMin);
  const [lockoutDurationMin, setLockoutDurationMin] = useState<number>(DEFAULTS.lockoutDurationMin);

  // Branding
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULTS.primaryColor);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULTS.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState<string>(DEFAULTS.faviconUrl);

  // Emails
  const [sendgridEnabled, setSendgridEnabled] = useState<boolean>(DEFAULTS.sendgridEnabled);
  const [sendgridFromEmail, setSendgridFromEmail] = useState<string>(DEFAULTS.sendgridFromEmail);

  const initialRef = useRef<Settings | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());
        const data: Settings = await res.json();
        if (!mounted) return;

        setSiteName(data.siteName);
        setSupportEmail(data.supportEmail);
        setMinPasswordLength(data.minPasswordLength);
        setPlatformFeePct(data.platformFeePct);
        setEnableRegistrations(data.enableRegistrations);
        setDefaultRole(data.defaultRole);
        setDefaultUserAvatar(data.defaultUserAvatar);

        setEnforceAdmin2FA(data.enforceAdmin2FA);
        setLockoutThreshold(data.lockoutThreshold);
        setLockoutWindowMin(data.lockoutWindowMin);
        setLockoutDurationMin(data.lockoutDurationMin);

        setPrimaryColor(data.primaryColor);
        setLogoUrl(data.logoUrl);
        setFaviconUrl(data.faviconUrl);

        setSendgridEnabled(data.sendgridEnabled);
        setSendgridFromEmail(data.sendgridFromEmail);

        initialRef.current = data;
      } catch (e: any) {
        toast.error(t('loadingError'), {
        description: e?.message ?? 'Unknown error'
      });
        initialRef.current = { ...DEFAULTS };
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const current: Settings = useMemo(() => ({
    siteName, supportEmail, minPasswordLength, platformFeePct, enableRegistrations, defaultRole, defaultUserAvatar,
    enforceAdmin2FA, lockoutThreshold, lockoutWindowMin, lockoutDurationMin,
    primaryColor, logoUrl, faviconUrl,
    sendgridEnabled, sendgridFromEmail,
  }), [
    siteName, supportEmail, minPasswordLength, platformFeePct, enableRegistrations, defaultRole, defaultUserAvatar,
    enforceAdmin2FA, lockoutThreshold, lockoutWindowMin, lockoutDurationMin,
    primaryColor, logoUrl, faviconUrl,
    sendgridEnabled, sendgridFromEmail,
  ]);

  const dirty = useMemo(() => {
    const init = initialRef.current;
    if (!init) return false;
    return JSON.stringify(init) !== JSON.stringify(current);
  }, [current]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  function pickImage(setter: (v: string) => void, label: string, maxMB: number) {
    const byUrl = confirm(
      `${t('imageUpload.promptTitle', { label })}\n\n${t('imageUpload.promptMessage')}`
    );
    if (byUrl) {
      const url = prompt(t('imageUpload.urlPrompt'));
      if (!url) {
        toast.warning(t('imageUpload.noUrl'), {
        description: t('imageUpload.noUrlMessage', { label
      }) });
        return;
      }
      if (!/^https?:\/\/.+/i.test(url)) {
        toast.error(t('imageUpload.invalidUrl'), {
        description: t('imageUpload.invalidUrlMessage')
      });
        return;
      }
      setter(url);
      toast.success(t('imageUpload.updated', { label }), {
        description: t('imageUpload.fromUrl')
      });
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) {
        toast.warning(t('imageUpload.noFile'), {
          description: t('imageUpload.noFileMessage', { label })
        });
        return;
      }
      if (f.size > maxMB * 1024 * 1024) {
        toast.error(t('imageUpload.fileTooLarge'), {
          description: t('imageUpload.fileTooLargeMessage', { maxMB })
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        if (!dataUrl.startsWith('data:image')) {
          toast.error(t('imageUpload.invalidFile'), {
            description: t('imageUpload.invalidFileMessage')
          });
          return;
        }
        setter(dataUrl);
        toast.success(t('imageUpload.updated', { label }), {
          description: t('imageUpload.localImageApplied')
        });
      };
      reader.readAsDataURL(f);
    };
    input.click();
  }

  function validate(): string | null {
    if (!siteName || siteName.trim().length < 2) return t('validationErrors.siteNameTooShort');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) return t('validationErrors.invalidSupportEmail');
    if (!Number.isFinite(minPasswordLength) || minPasswordLength < 8 || minPasswordLength > 128) return t('validationErrors.invalidPasswordLength');
    if (!Number.isFinite(platformFeePct) || platformFeePct < 0 || platformFeePct > 100) return t('validationErrors.invalidPlatformFee');
    if (!defaultUserAvatar) return t('validationErrors.defaultAvatarRequired');

    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor)) return t('validationErrors.invalidPrimaryColor');
    if (!logoUrl) return t('validationErrors.logoRequired');
    if (!faviconUrl) return t('validationErrors.faviconRequired');

    if (!Number.isFinite(lockoutThreshold) || lockoutThreshold < 3 || lockoutThreshold > 20) return t('validationErrors.invalidLockoutThreshold');
    if (!Number.isFinite(lockoutWindowMin) || lockoutWindowMin < 1 || lockoutWindowMin > 120) return t('validationErrors.invalidLockoutWindow');
    if (!Number.isFinite(lockoutDurationMin) || lockoutDurationMin < 5 || lockoutDurationMin > 1440) return t('validationErrors.invalidLockoutDuration');

    if (sendgridEnabled && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendgridFromEmail)) return t('validationErrors.invalidSendgridEmail');

    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) {
      toast.error(t('toasts.validation'), {
        description: err
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const saved = await res.json() as Settings;
      initialRef.current = saved;
      toast.success(t('toasts.settingsSaved'), {
        description: t('toasts.settingsSavedMessage')
      });
    } catch (e: any) {
      toast.error(t('toasts.saveFailed'), {
        description: e?.message ?? 'Unknown error'
      });
    } finally {
      setSaving(false);
    }
  }

  function handleResetDefaults() {
    if (!confirm(t('confirmations.resetAll'))) {
      toast.info(t('toasts.actionCancelled'), {
        description: t('toasts.actionCancelledMessage')
      });
      return;
    }
    // Core
    setSiteName(DEFAULTS.siteName);
    setSupportEmail(DEFAULTS.supportEmail);
    setMinPasswordLength(DEFAULTS.minPasswordLength);
    setPlatformFeePct(DEFAULTS.platformFeePct);
    setEnableRegistrations(DEFAULTS.enableRegistrations);
    setDefaultRole(DEFAULTS.defaultRole);
    setDefaultUserAvatar(DEFAULTS.defaultUserAvatar);
    // Sec
    setEnforceAdmin2FA(DEFAULTS.enforceAdmin2FA);
    setLockoutThreshold(DEFAULTS.lockoutThreshold);
    setLockoutWindowMin(DEFAULTS.lockoutWindowMin);
    setLockoutDurationMin(DEFAULTS.lockoutDurationMin);
    // Branding
    setPrimaryColor(DEFAULTS.primaryColor);
    setLogoUrl(DEFAULTS.logoUrl);
    setFaviconUrl(DEFAULTS.faviconUrl);
    // Emails
    setSendgridEnabled(DEFAULTS.sendgridEnabled);
    setSendgridFromEmail(DEFAULTS.sendgridFromEmail);

    toast.warning(t('toasts.resetNotSaved'), {
        description: t('toasts.resetNotSavedMessage')
      });
  }

  async function handleTestEmail() {
    try {
      const to = prompt(t('testEmailPrompt.addressPrompt'), supportEmail || 'you@example.com');
      if (!to) return;
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'testEmail', to }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      toast.success(t('testEmailPrompt.success'), {
        description: t('testEmailPrompt.successMessage')
      });
    } catch (e: any) {
      toast.error(t('testEmailPrompt.error'), {
        description: e?.message ?? 'Unknown error'
      });
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleResetDefaults} variant="outline" disabled={saving}>
            {t('actions.reset')}
          </Button>
          <a
            href="/api/admin/settings/backup"
            className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {t('actions.downloadBackup')}
          </a>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            aria-busy={saving}
            className="bg-gradient-to-r from-brand-start to-brand-end text-white disabled:opacity-50"
          >
            {saving ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900" dangerouslySetInnerHTML={{ __html: t('unsavedWarning') }} />
      )}

      {/* CORE */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="siteName">{t('core.siteName')}</Label>
            <Input id="siteName" className="h-10" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder={t('core.siteNamePlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">{t('core.supportEmail')}</Label>
            <Input id="supportEmail" className="h-10" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder={t('core.supportEmailPlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minPasswordLength">{t('core.minPasswordLength')}</Label>
            <Input id="minPasswordLength" className="h-10 pr-10" type="number" min={8} max={128} value={String(minPasswordLength)} onChange={(e) => setMinPasswordLength(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformFeePct">{t('core.platformFeePct')}</Label>
            <Input id="platformFeePct" className="h-10 pr-10" type="number" min={0} max={100} value={String(platformFeePct)} onChange={(e) => setPlatformFeePct(Number(e.target.value))} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-1">
              <Label htmlFor="enableRegistrations">{t('core.enableRegistrations')}</Label>
              <p className="text-sm text-gray-500">{t('core.enableRegistrationsDesc')}</p>
            </div>
            <Switch id="enableRegistrations" checked={enableRegistrations} onCheckedChange={(v) => setEnableRegistrations(v === true)} />
          </div>

          <div className="space-y-2">
            <Label>{t('core.defaultRole')}</Label>
            <Select value={defaultRole} onValueChange={(v) => setDefaultRole(v as 'User' | 'Creator')}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('core.defaultRolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('core.defaultAvatar')}</Label>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={defaultUserAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-brand-start to-brand-end text-white">DF</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => pickImage(setDefaultUserAvatar, t('core.defaultAvatar'), 2)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {t('actions.update')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const url = prompt(t('avatarPrompt.urlPrompt'));
                    if (!url) return;
                    if (!/^https?:\/\/.+/i.test(url)) {
                      toast.error(t('imageUpload.invalidUrl'), {
        description: t('imageUpload.invalidUrlMessage')
      });
                      return;
                    }
                    setDefaultUserAvatar(url);
                    toast.success(t('avatarPrompt.avatarUpdated'), {
        description: t('imageUpload.fromUrl')
      });
                  }}
                >
                  {t('actions.setViaUrl')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">{t('security.title')}</h2>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">{t('security.enforceAdmin2FA')}</p>
            <p className="text-sm text-gray-500">{t('security.enforceAdmin2FADesc')}</p>
          </div>
          <Switch checked={enforceAdmin2FA} onCheckedChange={(v) => setEnforceAdmin2FA(v === true)} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="lockoutThreshold">{t('security.lockoutThreshold')}</Label>
            <Input id="lockoutThreshold" className="h-10 pr-10" type="number" min={3} max={20} value={String(lockoutThreshold)} onChange={(e) => setLockoutThreshold(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="lockoutWindowMin">{t('security.lockoutWindow')}</Label>
            <Input id="lockoutWindowMin" className="h-10 pr-10" type="number" min={1} max={120} value={String(lockoutWindowMin)} onChange={(e) => setLockoutWindowMin(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="lockoutDurationMin">{t('security.lockoutDuration')}</Label>
            <Input id="lockoutDurationMin" className="h-10 pr-10" type="number" min={5} max={1440} value={String(lockoutDurationMin)} onChange={(e) => setLockoutDurationMin(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* UI / Branding */}
      <div className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">{t('branding.title')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">{t('branding.primaryColor')}</Label>
            <div className="flex items-center gap-2">
              <Input id="primaryColor" className="h-10" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#00B8A9" />
              <input
                aria-label={t('branding.colorAriaLabel')}
                type="color"
                value={/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor) ? primaryColor : '#00B8A9'}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-md border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('branding.logo')}</Label>
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="logo" className="h-10 w-auto rounded border bg-white" />
              <Button type="button" variant="outline" onClick={() => pickImage(setLogoUrl, t('branding.logo'), 2)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                {t('actions.update')}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('branding.favicon')}</Label>
            <div className="flex items-center gap-2">
              <img src={faviconUrl} alt="favicon" className="h-10 w-10 rounded border bg-white" />
              <Button type="button" variant="outline" onClick={() => pickImage(setFaviconUrl, t('branding.favicon'), 1)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                {t('actions.update')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Emails */}
      <div className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">{t('emails.title')}</h2>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">{t('emails.sendgridEnabled')}</p>
            <p className="text-sm text-gray-500">{t('emails.sendgridEnabledDesc')}</p>
          </div>
          <Switch checked={sendgridEnabled} onCheckedChange={(v) => setSendgridEnabled(v === true)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sgFrom">{t('emails.fromEmail')}</Label>
            <Input id="sgFrom" className="h-10" type="email" placeholder="no-reply@oliver.app" value={sendgridFromEmail} onChange={(e) => setSendgridFromEmail(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleTestEmail}
              className="bg-gradient-to-r from-brand-start to-brand-end text-white"
              disabled={!sendgridEnabled}
            >
              {t('emails.testEmail')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" onClick={handleResetDefaults} variant="outline" disabled={saving}>
          {t('actions.reset')}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          aria-busy={saving}
          className="bg-gradient-to-r from-brand-start to-brand-end text-white disabled:opacity-50"
        >
          {saving ? t('actions.saving') : t('actions.save')}
        </Button>
      </div>
    </div>
  );
}
