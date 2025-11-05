'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  Mail,
  Key,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Lock,
  Smartphone,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useFanPreferences, useUpdateFanPreferences } from '../_hooks/useFanData';
import { adminToasts } from '@/lib/toasts';

interface FanSettingsTabProps {
  userId: string;
}

export function FanSettingsTab({ userId }: FanSettingsTabProps) {
  // Fetch preferences data
  const { data: preferences, isLoading, error } = useFanPreferences(userId);
  const updatePreferencesMutation = useUpdateFanPreferences();

  const [isEmailVerified, setIsEmailVerified] = useState(false); // TODO: Get from user account data
  const [isBlocked, setIsBlocked] = useState(false); // TODO: Get from user account data
  const [has2FA, setHas2FA] = useState(false); // TODO: Get from user account data

  const [showVerifyEmailDialog, setShowVerifyEmailDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);

  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation1, setDeleteConfirmation1] = useState('');
  const [deleteConfirmation2, setDeleteConfirmation2] = useState('');
  const [deleteConfirmation3, setDeleteConfirmation3] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !preferences) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des préférences</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const userEmail = 'user@example.com'; // TODO: Get from user account data

  const handleVerifyEmail = async () => {
    setIsProcessing(true);
    console.log('✉️ [VERIFY EMAIL] Forcing email verification for user:', userId);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsEmailVerified(true);
      adminToasts.general.updateSuccess();
      setShowVerifyEmailDialog(false);
      console.log('✅ [VERIFY EMAIL] Email verified successfully');
    } catch (error) {
      console.error('❌ [VERIFY EMAIL] Error:', error);
      adminToasts.general.updateFailed();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    setIsProcessing(true);
    console.log('🔑 [RESET PASSWORD] Sending reset email to:', userEmail);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      adminToasts.general.updateSuccess();
      setShowResetPasswordDialog(false);
      console.log('✅ [RESET PASSWORD] Reset email sent successfully');
    } catch (error) {
      console.error('❌ [RESET PASSWORD] Error:', error);
      adminToasts.general.updateFailed();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      adminToasts.general.validationError('Veuillez saisir une raison');
      return;
    }

    if (deleteConfirmation1.toLowerCase() !== 'supprimer') {
      adminToasts.general.validationError('Confirmation 1 incorrecte');
      return;
    }

    if (deleteConfirmation2.toLowerCase() !== 'définitif') {
      adminToasts.general.validationError('Confirmation 2 incorrecte');
      return;
    }

    if (deleteConfirmation3.toLowerCase() !== 'confirmer') {
      adminToasts.general.validationError('Confirmation 3 incorrecte');
      return;
    }

    setIsProcessing(true);
    console.log('🗑️ [DELETE ACCOUNT] Deleting account:', { userId, reason: deleteReason });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      adminToasts.users.deleted();
      setShowDeleteAccountDialog(false);
      console.log('✅ [DELETE ACCOUNT] Account deleted successfully');
    } catch (error) {
      console.error('❌ [DELETE ACCOUNT] Error:', error);
      adminToasts.general.deleteFailed();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBlock = async () => {
    setIsProcessing(true);
    const action = isBlocked ? 'débloquer' : 'bloquer';
    console.log(`🚫 [BLOCK TOGGLE] ${action} user:`, userId);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsBlocked(!isBlocked);
      adminToasts.general.updateSuccess();
      setShowBlockDialog(false);
      console.log(`✅ [BLOCK TOGGLE] User ${action}ed successfully`);
    } catch (error) {
      console.error('❌ [BLOCK TOGGLE] Error:', error);
      adminToasts.general.updateFailed();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsProcessing(true);
    const action = has2FA ? 'désactiver' : 'activer';
    console.log(`🔐 [2FA TOGGLE] ${action} 2FA for user:`, userId);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setHas2FA(!has2FA);
      adminToasts.general.updateSuccess();
      setShow2FADialog(false);
      console.log(`✅ [2FA TOGGLE] 2FA ${action}ed successfully`);
    } catch (error) {
      console.error('❌ [2FA TOGGLE] Error:', error);
      adminToasts.general.updateFailed();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <Card className="border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Statut du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Email vérifié</p>
                <Badge
                  className={
                    isEmailVerified
                      ? 'bg-green-50 text-green-700 border-green-200 mt-2'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 mt-2'
                  }
                >
                  {isEmailVerified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Vérifié
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Non vérifié
                    </>
                  )}
                </Badge>
              </div>
              <Mail className={`w-6 h-6 ${isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Authentification 2FA</p>
                <Badge
                  className={
                    has2FA
                      ? 'bg-blue-50 text-blue-700 border-blue-200 mt-2'
                      : 'bg-gray-50 text-gray-700 border-gray-200 mt-2'
                  }
                >
                  {has2FA ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Activée
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Désactivée
                    </>
                  )}
                </Badge>
              </div>
              <Smartphone className={`w-6 h-6 ${has2FA ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Accès au compte</p>
                <Badge
                  className={
                    isBlocked
                      ? 'bg-red-50 text-red-700 border-red-200 mt-2'
                      : 'bg-green-50 text-green-700 border-green-200 mt-2'
                  }
                >
                  {isBlocked ? (
                    <>
                      <Ban className="w-3 h-3 mr-1" />
                      Bloqué
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Actif
                    </>
                  )}
                </Badge>
              </div>
              <Shield className={`w-6 h-6 ${isBlocked ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Gestion de l'email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email actuel</p>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
              <Badge
                className={
                  isEmailVerified
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }
              >
                {isEmailVerified ? 'Vérifié' : 'Non vérifié'}
              </Badge>
            </div>

            {!isEmailVerified && (
              <Button
                onClick={() => setShowVerifyEmailDialog(true)}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Forcer la vérification de l'email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Mot de passe</p>
                <p className="text-sm text-gray-600">Envoyer un email de réinitialisation</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordDialog(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Authentification à deux facteurs (2FA)</p>
                <p className="text-sm text-gray-600">
                  {has2FA ? 'Désactiver la double authentification' : 'Activer la double authentification'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShow2FADialog(true)}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {has2FA ? 'Désactiver' : 'Activer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Bloquer / Débloquer l'accès</p>
                <p className="text-sm text-gray-600">
                  {isBlocked
                    ? 'Utilisateur actuellement bloqué - ne peut pas se connecter'
                    : 'Utilisateur actif - peut se connecter normalement'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!isBlocked}
                  onCheckedChange={() => setShowBlockDialog(true)}
                />
                <span className="text-sm font-medium">
                  {isBlocked ? 'Bloqué' : 'Actif'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Zone dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white border-2 border-red-300 rounded-lg">
            <div>
              <p className="font-bold text-red-900">Supprimer le compte</p>
              <p className="text-sm text-red-700">
                ⚠️ Action irréversible - Toutes les données seront définitivement supprimées
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => setShowDeleteAccountDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verify Email Dialog */}
      <Dialog open={showVerifyEmailDialog} onOpenChange={setShowVerifyEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Forcer la vérification de l'email
            </DialogTitle>
            <DialogDescription>
              Cette action marquera l'email comme vérifié sans que l'utilisateur ait cliqué sur le lien de vérification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {userEmail}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyEmailDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleVerifyEmail} disabled={isProcessing}>
              {isProcessing ? 'Vérification...' : 'Vérifier l\'email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Réinitialiser le mot de passe
            </DialogTitle>
            <DialogDescription>
              Un email de réinitialisation sera envoyé à l'utilisateur. Il pourra créer un nouveau mot de passe via le lien reçu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email de réception:</strong> {userEmail}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleResetPassword} disabled={isProcessing}>
              {isProcessing ? 'Envoi...' : 'Envoyer l\'email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Supprimer définitivement le compte
            </DialogTitle>
            <DialogDescription className="text-red-600 font-medium">
              ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE et supprimera toutes les données de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-sm text-red-900 font-medium mb-2">
                Les éléments suivants seront DÉFINITIVEMENT supprimés:
              </p>
              <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                <li>Profil utilisateur et informations personnelles</li>
                <li>Historique des transactions et achats</li>
                <li>Abonnements actifs</li>
                <li>Contenus favoris et historique de visionnage</li>
                <li>Commentaires et interactions</li>
                <li>Tous les logs d'activité</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de la suppression *
              </label>
              <Textarea
                placeholder="Expliquez pourquoi vous supprimez ce compte..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                Confirmations requises (3/3):
              </p>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  1. Tapez <strong>"supprimer"</strong> pour confirmer
                </label>
                <Input
                  placeholder="supprimer"
                  value={deleteConfirmation1}
                  onChange={(e) => setDeleteConfirmation1(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  2. Tapez <strong>"définitif"</strong> pour confirmer que c'est irréversible
                </label>
                <Input
                  placeholder="définitif"
                  value={deleteConfirmation2}
                  onChange={(e) => setDeleteConfirmation2(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  3. Tapez <strong>"confirmer"</strong> pour procéder à la suppression
                </label>
                <Input
                  placeholder="confirmer"
                  value={deleteConfirmation3}
                  onChange={(e) => setDeleteConfirmation3(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={
                isProcessing ||
                !deleteReason.trim() ||
                deleteConfirmation1.toLowerCase() !== 'supprimer' ||
                deleteConfirmation2.toLowerCase() !== 'définitif' ||
                deleteConfirmation3.toLowerCase() !== 'confirmer'
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Suppression...' : 'SUPPRIMER DÉFINITIVEMENT'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-orange-600" />
              {isBlocked ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {isBlocked
                ? 'L\'utilisateur pourra à nouveau se connecter et accéder à son compte.'
                : 'L\'utilisateur ne pourra plus se connecter jusqu\'à ce qu\'il soit débloqué.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className={`p-4 border rounded-lg ${isBlocked ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <p className="text-sm font-medium">
                {isBlocked
                  ? '✅ Après déblocage, l\'utilisateur pourra se connecter normalement'
                  : '⚠️ Après blocage, l\'utilisateur ne pourra plus se connecter'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleToggleBlock}
              disabled={isProcessing}
              className={isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {isProcessing ? 'Traitement...' : isBlocked ? 'Débloquer' : 'Bloquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              {has2FA ? 'Désactiver la 2FA' : 'Activer la 2FA'}
            </DialogTitle>
            <DialogDescription>
              {has2FA
                ? 'L\'utilisateur n\'aura plus besoin de code de vérification pour se connecter.'
                : 'L\'utilisateur devra saisir un code de vérification à chaque connexion.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className={`p-4 border rounded-lg ${has2FA ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              <p className="text-sm font-medium">
                {has2FA
                  ? '⚠️ La désactivation de la 2FA réduira la sécurité du compte'
                  : '🔒 L\'activation de la 2FA augmentera la sécurité du compte'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleToggle2FA} disabled={isProcessing}>
              {isProcessing ? 'Traitement...' : has2FA ? 'Désactiver la 2FA' : 'Activer la 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
