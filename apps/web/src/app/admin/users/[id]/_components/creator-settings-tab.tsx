'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Globe,
  Clock,
  Eye,
  Euro,
  CreditCard,
  LogOut,
  Key,
  MessageSquare,
  Settings as SettingsIcon,
  Info,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CreatorSettings } from '../_types/creator-types';
import { useCreatorProfile, useUpdateCreatorProfile } from '../_hooks/useCreatorData';

interface CreatorSettingsTabProps {
  userId: string;
}

export function CreatorSettingsTab({ userId }: CreatorSettingsTabProps) {
  // ========================================
  // ✅ SECTION 1 : TOUS LES HOOKS EN PREMIER
  // ========================================

  // Local state hooks
  const [isProcessing, setIsProcessing] = useState(false);

  // Data hooks
  const { data: profile, isLoading, error } = useCreatorProfile(userId);
  const updateProfileMutation = useUpdateCreatorProfile();

  // ========================================
  // ✅ SECTION 2 : VARIABLES DÉRIVÉES
  // ========================================
  const settings = profile?.settings || {};
  const creatorId = userId;
  const creatorName = profile?.displayName || profile?.username || 'Créateur';

  // ========================================
  // ✅ SECTION 3 : CONDITIONS ET EARLY RETURNS
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Échec du chargement des paramètres</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // ============================================
  // HANDLERS - ADMIN ACTIONS
  // ============================================

  const handleUpdateStatus = async (newStatus: string) => {
    const statusLabels: Record<string, string> = {
      active: 'Actif',
      verified: 'Vérifié',
      suspended: 'Suspendu',
      banned: 'Banni',
    };

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir modifier le statut de ${creatorName} à ${statusLabels[newStatus]} ?`
    );
    if (!confirmed) {
      console.log('🎭 [DEMO MODE] User cancelled status update');
      return;
    }

    console.log('🎭 [DEMO MODE] Updating status to:', newStatus);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success(`Statut mis à jour: ${statusLabels[newStatus]}`);
      console.log('🎭 [DEMO MODE] Status updated successfully');
    } catch (error) {
      console.error('🎭 [DEMO MODE] Error updating status:', error);
      toast.error('Échec de la mise à jour du statut');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceLogout = async () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir forcer la déconnexion de ${creatorName} ?`
    );
    if (!confirmed) {
      console.log('🎭 [DEMO MODE] User cancelled force logout');
      return;
    }

    console.log('🎭 [DEMO MODE] Logging out all sessions for:', creatorId);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Toutes les sessions ont été déconnectées');
      console.log('🎭 [DEMO MODE] All sessions logged out successfully');
    } catch (error) {
      console.error('🎭 [DEMO MODE] Error logging out:', error);
      toast.error('Échec de la déconnexion');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    const confirmed = window.confirm(
      `Envoyer un email de réinitialisation du mot de passe à ${creatorName} ?`
    );
    if (!confirmed) {
      console.log('🎭 [DEMO MODE] User cancelled password reset');
      return;
    }

    console.log('🎭 [DEMO MODE] Sending reset email to:', creatorId);
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Email de réinitialisation envoyé');
      console.log('🎭 [DEMO MODE] Reset email sent successfully');
    } catch (error) {
      console.error('🎭 [DEMO MODE] Error sending reset email:', error);
      toast.error('Échec de l\'envoi de l\'email');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactCreator = async () => {
    console.log('🎭 [DEMO MODE] Opening contact form for:', creatorId);
    toast.info(`Ouverture du formulaire de contact pour ${creatorName}`);
    // TODO: Open contact creator modal
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Actif
          </Badge>
        );
      case 'verified':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Vérifié
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Suspendu
          </Badge>
        );
      case 'banned':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Banni
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* ACCOUNT STATUS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email Verified */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email vérifié</span>
              </div>
              {settings.accountStatus?.emailVerified ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Oui
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Non
                </Badge>
              )}
            </div>

            {/* 2FA Enabled */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Authentification 2FA</span>
              </div>
              {settings.accountStatus?.has2FA ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activée
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Désactivée
                </Badge>
              )}
            </div>

            {/* Verified Badge */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Badge vérifié</span>
              </div>
              {settings.accountStatus?.isVerified ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Oui
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Non
                </Badge>
              )}
            </div>

            {/* Account Access */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Accès au compte</span>
              </div>
              {getStatusBadge(settings.accountStatus?.accountAccess || 'active')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* PREFERENCES */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Notifications */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Notifications
              </label>
              <div className="p-3 border rounded-lg">
                {settings.preferences?.notificationsEnabled ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activées
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Désactivées
                  </Badge>
                )}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Langue
              </label>
              <div className="p-3 border rounded-lg">
                <Badge variant="outline">
                  {settings.preferences?.language?.toUpperCase() || 'FR'}
                </Badge>
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Fuseau horaire
              </label>
              <div className="p-3 border rounded-lg">
                <span className="text-sm">{settings.preferences?.timezone || 'Europe/Paris'}</span>
              </div>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Visibilité du profil
              </label>
              <div className="p-3 border rounded-lg">
                <Badge
                  variant="outline"
                  className={
                    (settings.preferences?.profileVisibility || 'public') === 'public'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {(settings.preferences?.profileVisibility || 'public') === 'public'
                    ? 'Public'
                    : 'Privé'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* MONETIZATION SETTINGS - READ ONLY */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Monétisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Ces paramètres sont en lecture seule. Le créateur peut les modifier depuis son dashboard.
              </AlertDescription>
            </Alert>

            {/* Subscription Prices - Read Only */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Prix des abonnements</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Plan Basique</span>
                    <Euro className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {settings.monetization?.basicPrice?.toFixed(2) || '9.99'} €/mois
                  </p>
                </div>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Plan VIP</span>
                    <Euro className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {settings.monetization?.vipPrice?.toFixed(2) || '19.99'} €/mois
                  </p>
                </div>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Plan Premium</span>
                    <Euro className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {settings.monetization?.premiumPrice?.toFixed(2) || '29.99'} €/mois
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Commission - Read Only */}
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Commission de la plateforme</span>
                <Badge className="bg-blue-500">
                  {settings.monetization?.platformCommission || 15}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Commission prélevée sur chaque transaction
              </p>
            </div>

            {/* Payment Method - Read Only */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Méthode de paiement
              </label>
              <div className="p-3 border rounded-lg bg-gray-50">
                <Badge variant="outline" className="bg-white">
                  {settings.monetization?.paymentMethod === 'bank' && 'Virement bancaire'}
                  {settings.monetization?.paymentMethod === 'paypal' && 'PayPal'}
                  {!settings.monetization?.paymentMethod && (
                    <span className="text-orange-700">Non configuré</span>
                  )}
                </Badge>
              </div>
            </div>

            {/* Minimum Withdrawal - Read Only */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Retrait minimum</label>
              <p className="text-xs text-muted-foreground">
                Montant minimum requis pour effectuer un retrait
              </p>
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-lg font-bold text-gray-900">
                  {settings.monetization?.minimumWithdrawal || 50} €
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* ADMIN ACTIONS */}
      {/* ============================================ */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Shield className="h-5 w-5" />
            Actions administrateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Update Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Modifier le statut du compte</label>
              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('active')}
                  disabled={isProcessing}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('verified')}
                  disabled={isProcessing}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Vérifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('suspended')}
                  disabled={isProcessing}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Suspendre
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('banned')}
                  disabled={isProcessing}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Bannir
                </Button>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              {/* Force Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceLogout}
                disabled={isProcessing}
                className="w-full"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Forcer la déconnexion
              </Button>

              {/* Reset Password */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPassword}
                disabled={isProcessing}
                className="w-full"
              >
                <Key className="h-3 w-3 mr-2" />
                Réinitialiser le mot de passe
              </Button>

              {/* Contact Creator */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleContactCreator}
                disabled={isProcessing}
                className="w-full"
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                Contacter le créateur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* INFO BOX */}
      {/* ============================================ */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <Shield className="h-4 w-4" />
            Informations importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>Statut du compte :</strong>{' '}
              Modifiez le statut pour gérer l'accès du créateur à la plateforme.
            </p>
            <p>
              <strong>Monétisation :</strong>{' '}
              Les paramètres de monétisation sont en lecture seule et ne peuvent être modifiés que par le créateur.
            </p>
            <p>
              <strong>Actions critiques :</strong>{' '}
              Les actions de suspension et de bannissement sont irréversibles et doivent être utilisées avec précaution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
