'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Loader2,
  Shield,
  QrCode,
  Key,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Zod Schema
const enable2FASchema = z.object({
  token: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d{6}$/, 'Le code doit être numérique'),
});

type Enable2FAFormValues = z.infer<typeof enable2FASchema>;

const disable2FASchema = z.object({
  token: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d{6}$/, 'Le code doit être numérique'),
});

type Disable2FAFormValues = z.infer<typeof disable2FASchema>;

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const enableForm = useForm<Enable2FAFormValues>({
    resolver: zodResolver(enable2FASchema),
    defaultValues: {
      token: '',
    },
  });

  const disableForm = useForm<Disable2FAFormValues>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: {
      token: '',
    },
  });

  // Check 2FA status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/security/2fa/status');
      const data = await response.json();
      setIs2FAEnabled(data.enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/security/2fa/generate');
      if (!response.ok) throw new Error('Failed to generate 2FA secret');

      const data = await response.json();
      setQrCodeUrl(data.qrCode);
      setSecret(data.secret);
      toast.success('QR code généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const onEnableSubmit = async (data: Enable2FAFormValues) => {
    if (!secret) {
      toast.error('Veuillez générer un QR code d\'abord');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/security/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, token: data.token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enable 2FA');
      }

      toast.success('2FA activé avec succès');
      setIs2FAEnabled(true);
      setQrCodeUrl(null);
      setSecret(null);
      enableForm.reset();

      // Generate backup codes
      await generateBackupCodes();
    } catch (error: any) {
      toast.error(error.message || 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const onDisableSubmit = async (data: Disable2FAFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disable 2FA');
      }

      toast.success('2FA désactivé');
      setIs2FAEnabled(false);
      setBackupCodes([]);
      disableForm.reset();
    } catch (error: any) {
      toast.error(error.message || 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    try {
      const response = await fetch('/api/security/2fa/backup-codes', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate backup codes');

      const data = await response.json();
      setBackupCodes(data.codes);
      setShowBackupCodes(true);
    } catch (error) {
      toast.error('Erreur lors de la génération des codes de récupération');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Codes copiés dans le presse-papiers');
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Codes téléchargés');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authentification à Deux Facteurs</h1>
          <p className="text-gray-500 mt-1">Sécurisez votre compte avec 2FA</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${is2FAEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <CardTitle>Statut 2FA</CardTitle>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              is2FAEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {is2FAEnabled ? 'Activé' : 'Désactivé'}
            </div>
          </div>
          <CardDescription>
            {is2FAEnabled
              ? 'Votre compte est protégé par l\'authentification à deux facteurs'
              : 'Activez la 2FA pour renforcer la sécurité de votre compte'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Enable 2FA Flow */}
      {!is2FAEnabled && (
        <>
          {/* Generate QR Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-500" />
                <CardTitle>Étape 1: Scannez le QR Code</CardTitle>
              </div>
              <CardDescription>
                Utilisez Google Authenticator, Authy ou une autre app TOTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!qrCodeUrl ? (
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Générer le QR Code
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <img src={qrCodeUrl} alt="QR Code 2FA" className="w-64 h-64 border-2 border-gray-200 rounded-lg" />
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-mono text-gray-700 text-center">{secret}</p>
                    <p className="text-xs text-gray-500 text-center mt-2">Clé secrète (si scan impossible)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verify Token */}
          {qrCodeUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-500" />
                  <CardTitle>Étape 2: Vérifiez le code</CardTitle>
                </div>
                <CardDescription>
                  Entrez le code à 6 chiffres affiché dans votre application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...enableForm}>
                  <form onSubmit={enableForm.handleSubmit(onEnableSubmit)} className="space-y-4">
                    <FormField
                      control={enableForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code de vérification</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000000"
                              maxLength={6}
                              className="text-center text-2xl tracking-widest font-mono"
                              {...field}
                              disabled={isLoading}
                              autoComplete="off"
                              aria-label="2FA verification code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activer la 2FA
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Backup Codes Display */}
      {showBackupCodes && backupCodes.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-amber-900">Codes de Récupération</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Sauvegardez ces codes dans un endroit sûr. Ils permettent de vous connecter si vous perdez votre appareil 2FA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-white rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="text-gray-700">
                  {index + 1}. {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Chaque code ne peut être utilisé qu'une seule fois. Conservez-les en sécurité.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Disable 2FA */}
      {is2FAEnabled && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Désactiver la 2FA</CardTitle>
            <CardDescription>
              Entrez votre code 2FA actuel pour désactiver l'authentification à deux facteurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...disableForm}>
              <form onSubmit={disableForm.handleSubmit(onDisableSubmit)} className="space-y-4">
                <FormField
                  control={disableForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code de vérification</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000000"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest font-mono"
                          {...field}
                          disabled={isLoading}
                          autoComplete="off"
                          aria-label="2FA code to disable"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Désactiver la 2FA rendra votre compte moins sécurisé.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Désactivation...
                    </>
                  ) : (
                    'Désactiver la 2FA'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Regenerate Backup Codes */}
      {is2FAEnabled && !showBackupCodes && (
        <Card>
          <CardHeader>
            <CardTitle>Codes de Récupération</CardTitle>
            <CardDescription>
              Générez de nouveaux codes de récupération si vous avez perdu les précédents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateBackupCodes}
              disabled={isLoading}
              variant="outline"
            >
              <Key className="w-4 h-4 mr-2" />
              Générer de Nouveaux Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
