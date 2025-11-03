// apps/web/src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle, Mail, Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

const twoFactorSchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d{6}$/, 'Le code doit être numérique'),
});

// Note: These are for form defaults only - actual auth is done via backend API
const DEFAULT_CREDENTIALS = {
  email: 'admin@oliver.com',
  password: 'Admin123!',
};

export default function AdminLoginPage() {
  const router = useRouter();
  const t = useTranslations('admin.login');

  const [email, setEmail] = useState('admin@oliver.com');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string }>({});

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorAttempts, setTwoFactorAttempts] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'email' | 'password';
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true);
    try {
      // Call the real backend API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      console.log('[Login] Calling backend API:', `${API_URL}/auth/login`);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: validation.data.email,
          password: validation.data.password,
        }),
      });

      console.log('[Login] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
        console.error('[Login] API error:', errorData);
        toast.error(errorData.message || 'Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[Login] API response:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        hasUser: !!data.user,
        user: data.user,
      });

      // Store user ID for potential 2FA
      setUserId(data.user.id);

      // Check if 2FA is enabled (TODO: backend should indicate this in response)
      // For now, proceed directly to login
      completeLogin(data.accessToken, data.refreshToken, data.user);
    } catch (error) {
      console.error('[Login] Error:', error);
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handle2FASubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const validation = twoFactorSchema.safeParse({ code: twoFactorCode });
    if (!validation.success) {
      setErrors({ code: validation.error.issues[0].message });
      toast.error('Code 2FA invalide');
      return;
    }

    // Check max attempts
    if (twoFactorAttempts >= 3) {
      toast.error('Nombre maximum de tentatives atteint. Veuillez recommencer.');
      // Reset to initial state
      setRequires2FA(false);
      setTwoFactorCode('');
      setTwoFactorAttempts(0);
      setUserId(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: twoFactorCode }),
      });

      const data = await response.json();

      if (data.valid) {
        // 2FA verified - complete login
        toast.success('Code 2FA vérifié');
        completeLogin(email);
      } else {
        // Invalid code - increment attempts
        const newAttempts = twoFactorAttempts + 1;
        setTwoFactorAttempts(newAttempts);
        setTwoFactorCode('');

        if (newAttempts >= 3) {
          toast.error('Nombre maximum de tentatives atteint. Recommencez.');
          setRequires2FA(false);
          setTwoFactorAttempts(0);
          setUserId(null);
        } else {
          toast.error(`Code 2FA incorrect. ${3 - newAttempts} tentative(s) restante(s).`);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification du code 2FA');
    } finally {
      setLoading(false);
    }
  }

  function completeLogin(accessToken: string, refreshToken: string, user: any) {
    console.log('[Login] completeLogin called with:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      user,
    });

    // Store in localStorage for HTTP interceptor (http.ts expects these keys)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(user));

    // Verify storage immediately
    console.log('[Login] ✅ localStorage set:', {
      accessToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
      refreshToken: localStorage.getItem('refreshToken')?.substring(0, 20) + '...',
      admin_user: localStorage.getItem('admin_user'),
    });

    // Store in cookies for both systems
    document.cookie = `admin_token=${accessToken}; path=/; max-age=86400`;

    // CRITICAL: Create auth-storage cookie for middleware compatibility
    const authStorage = {
      state: {
        isAuthenticated: true,
        role: user.role,
        onboardingDone: true,
        userId: user.id,
      }
    };
    const authStorageJson = JSON.stringify(authStorage);
    document.cookie = `auth-storage=${encodeURIComponent(authStorageJson)}; path=/; max-age=86400`;

    // Also create session cookie that middleware checks
    document.cookie = `oliver_admin_sid=${accessToken}; path=/; max-age=86400`;

    console.log('[Login] ✅ Cookies set:', {
      admin_token: '✓',
      'auth-storage': '✓',
      oliver_admin_sid: '✓'
    });

    toast.success(`Connexion réussie - Bienvenue ${user.displayName || user.email}`);

    console.log('[Login] 🚀 Navigating to dashboard...');
    router.push('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-4xl">O</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl text-gray-900">OLIVER</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {requires2FA ? 'Authentification à Deux Facteurs' : 'Administration'}
          </h1>
          <p className="text-gray-600">
            {requires2FA ? 'Entrez votre code 2FA pour continuer' : 'Connectez-vous pour accéder au panel'}
          </p>
        </div>

        {!requires2FA ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-600" />
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
              placeholder="admin@oliver.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-600" />
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-busy={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-cyan-100 p-4 rounded-full">
                <Shield className="w-8 h-8 text-cyan-600" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Code de Vérification</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  maxLength={6}
                  className={`pl-10 text-center text-2xl tracking-widest font-mono ${errors.code ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? 'code-error' : undefined}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              {errors.code && (
                <p id="code-error" className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.code}
                </p>
              )}
              <p className="text-xs text-gray-500 text-center mt-2">
                Entrez le code à 6 chiffres de votre application d'authentification
              </p>
              {twoFactorAttempts > 0 && (
                <p className="text-xs text-amber-600 text-center font-medium">
                  {3 - twoFactorAttempts} tentative(s) restante(s)
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white"
              disabled={loading || twoFactorCode.length !== 6}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Vérifier le Code
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setRequires2FA(false);
                setTwoFactorCode('');
                setTwoFactorAttempts(0);
                setUserId(null);
              }}
              disabled={loading}
            >
              Retour
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>{t('help')}</p>
        </div>
      </Card>
    </div>
  );
}