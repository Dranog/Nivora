/**
 * Toast Notifications Library
 * Centralized toast messages for consistent UX across the admin panel
 */

import { toast as globalToast } from '@/components/ui/use-toast';

// ============================================================================
// TYPES
// ============================================================================

export type ToastVariant = 'default' | 'destructive' | 'success' | 'info' | 'warning' | 'error';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// ============================================================================
// TOAST HELPER FUNCTIONS
// ============================================================================

/**
 * Show a success toast
 */
export function showSuccessToast(title: string, description?: string, duration?: number) {
  return globalToast({
    title,
    description,
    variant: 'success',
    duration,
  });
}

/**
 * Show an error toast
 */
export function showErrorToast(title: string, description?: string, duration?: number) {
  return globalToast({
    title,
    description,
    variant: 'destructive',
    duration,
  });
}

/**
 * Show an info toast
 */
export function showInfoToast(title: string, description?: string, duration?: number) {
  return globalToast({
    title,
    description,
    variant: 'info',
    duration,
  });
}

/**
 * Show a warning toast
 */
export function showWarningToast(title: string, description?: string, duration?: number) {
  return globalToast({
    title,
    description,
    variant: 'warning',
    duration,
  });
}

// ============================================================================
// ADMIN TOAST MESSAGES (French)
// ============================================================================

export const adminToasts = {
  // User Management
  users: {
    banned: () => showSuccessToast('Utilisateur banni', 'L\'utilisateur a été banni avec succès'),
    unbanned: () => showSuccessToast('Utilisateur débanni', 'L\'utilisateur a été débanni avec succès'),
    bulkBanned: (count: number) =>
      showSuccessToast('Utilisateurs bannis', `${count} utilisateur(s) ont été bannis avec succès`),
    bulkUnbanned: (count: number) =>
      showSuccessToast('Utilisateurs débannis', `${count} utilisateur(s) ont été débannis avec succès`),
    updated: () => showSuccessToast('Utilisateur mis à jour', 'Les informations ont été mises à jour'),
    deleted: () => showSuccessToast('Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès'),
    banFailed: (error?: string) =>
      showErrorToast('Échec du bannissement', error || 'Impossible de bannir l\'utilisateur'),
    unbanFailed: (error?: string) =>
      showErrorToast('Échec du débannissement', error || 'Impossible de débannir l\'utilisateur'),
    updateFailed: (error?: string) =>
      showErrorToast('Échec de la mise à jour', error || 'Impossible de mettre à jour l\'utilisateur'),
  },

  // Post Management
  posts: {
    takenDown: () => showSuccessToast('Publication retirée', 'La publication a été retirée avec succès'),
    restored: () => showSuccessToast('Publication restaurée', 'La publication a été restaurée avec succès'),
    deleted: () => showSuccessToast('Publication supprimée', 'La publication a été supprimée avec succès'),
    bulkTakenDown: (count: number) =>
      showSuccessToast('Publications retirées', `${count} publication(s) ont été retirées avec succès`),
    bulkRestored: (count: number) =>
      showSuccessToast('Publications restaurées', `${count} publication(s) ont été restaurées avec succès`),
    takedownFailed: (error?: string) =>
      showErrorToast('Échec du retrait', error || 'Impossible de retirer la publication'),
    restoreFailed: (error?: string) =>
      showErrorToast('Échec de la restauration', error || 'Impossible de restaurer la publication'),
  },

  // Reports Management
  reports: {
    resolved: () => showSuccessToast('Signalement résolu', 'Le signalement a été résolu avec succès'),
    dismissed: () => showSuccessToast('Signalement rejeté', 'Le signalement a été rejeté avec succès'),
    assigned: () => showSuccessToast('Signalement assigné', 'Le signalement a été assigné avec succès'),
    unassigned: () => showSuccessToast('Assignation annulée', 'L\'assignation a été annulée avec succès'),
    updated: () => showSuccessToast('Signalement mis à jour', 'Le signalement a été mis à jour avec succès'),
    bulkResolved: (count: number) =>
      showSuccessToast('Signalements résolus', `${count} signalement(s) ont été résolus avec succès`),
    bulkActionPartial: (success: number, failed: number) =>
      showWarningToast(
        'Action groupée partiellement réussie',
        `${success} réussi(s), ${failed} échec(s)`
      ),
    resolveFailed: (error?: string) =>
      showErrorToast('Échec de la résolution', error || 'Impossible de résoudre le signalement'),
    updateFailed: (error?: string) =>
      showErrorToast('Échec de la mise à jour', error || 'Impossible de mettre à jour le signalement'),
  },

  // Transactions
  transactions: {
    refunded: () =>
      showSuccessToast('Transaction remboursée', 'La transaction a été remboursée avec succès'),
    cancelled: () => showSuccessToast('Transaction annulée', 'La transaction a été annulée avec succès'),
    refundFailed: (error?: string) =>
      showErrorToast('Échec du remboursement', error || 'Impossible de rembourser la transaction'),
    cancelFailed: (error?: string) =>
      showErrorToast('Échec de l\'annulation', error || 'Impossible d\'annuler la transaction'),
  },

  // Moderation
  moderation: {
    approved: () => showSuccessToast('Contenu approuvé', 'Le contenu a été approuvé avec succès'),
    rejected: () => showSuccessToast('Contenu rejeté', 'Le contenu a été rejeté et l\'action a été prise'),
    escalated: () => showSuccessToast('Contenu escaladé', 'Le contenu a été escaladé avec succès'),
    assigned: () => showSuccessToast('Élément assigné', 'L\'élément a été assigné avec succès'),
    bulkCompleted: (success: number) =>
      showSuccessToast('Action groupée terminée', `${success} élément(s) traités avec succès`),
    bulkPartialSuccess: (success: number, failed: number, total: number) =>
      showWarningToast(
        'Action groupée terminée avec des erreurs',
        `${success} réussi(s), ${failed} échec(s) sur ${total} élément(s)`
      ),
    approveFailed: (error?: string) =>
      showErrorToast('Échec de l\'approbation', error || 'Impossible d\'approuver le contenu'),
    rejectFailed: (error?: string) =>
      showErrorToast('Échec du rejet', error || 'Impossible de rejeter le contenu'),
    escalateFailed: (error?: string) =>
      showErrorToast('Échec de l\'escalade', error || 'Impossible d\'escalader le contenu'),
    assignFailed: (error?: string) =>
      showErrorToast('Échec de l\'assignation', error || 'Impossible d\'assigner l\'élément'),
    bulkFailed: (error?: string) =>
      showErrorToast('Échec de l\'action groupée', error || 'Impossible de réaliser l\'action groupée'),
  },

  // KYC Management
  kyc: {
    approved: () =>
      showSuccessToast('Vérification approuvée', 'La vérification KYC a été approuvée avec succès'),
    rejected: () =>
      showSuccessToast('Vérification rejetée', 'La vérification KYC a été rejetée avec succès'),
    levelUpdated: () => showSuccessToast('Niveau mis à jour', 'Le niveau KYC a été mis à jour avec succès'),
    recheckScheduled: () =>
      showSuccessToast('Revérification programmée', 'Une revérification a été programmée'),
    approveFailed: (error?: string) =>
      showErrorToast('Échec de l\'approbation', error || 'Impossible d\'approuver la vérification'),
    rejectFailed: (error?: string) =>
      showErrorToast('Échec du rejet', error || 'Impossible de rejeter la vérification'),
    updateFailed: (error?: string) =>
      showErrorToast('Échec de la mise à jour', error || 'Impossible de mettre à jour le niveau'),
  },

  // Analytics & Reports
  analytics: {
    exportSuccess: () => showSuccessToast('Export réussi', 'Le rapport a été exporté avec succès'),
    exportFailed: (error?: string) =>
      showErrorToast('Échec de l\'export', error || 'Impossible d\'exporter le rapport'),
    dataRefreshed: () => showSuccessToast('Données actualisées', 'Les métriques ont été mises à jour'),
    refreshFailed: (error?: string) =>
      showErrorToast('Échec de l\'actualisation', error || 'Impossible de rafraîchir les données'),
  },

  // Audit Log
  audit: {
    refreshed: () => showSuccessToast('Actualisé', 'Métriques et journaux mis à jour'),
    filtersReset: () => showInfoToast('Filtres réinitialisés', 'Tous les filtres ont été réinitialisés'),
    exportSuccess: () => showSuccessToast('Export réussi', 'Le journal d\'audit a été exporté'),
    refreshFailed: (error?: string) =>
      showErrorToast('Échec de l\'actualisation', error || 'Impossible de rafraîchir les données'),
    exportFailed: (error?: string) =>
      showErrorToast('Échec de l\'export', error || 'Impossible d\'exporter le journal'),
  },

  // General
  general: {
    saveSuccess: () => showSuccessToast('Enregistré', 'Les modifications ont été enregistrées'),
    deleteSuccess: () => showSuccessToast('Supprimé', 'L\'élément a été supprimé avec succès'),
    updateSuccess: () => showSuccessToast('Mis à jour', 'Les informations ont été mises à jour'),
    copySuccess: () => showSuccessToast('Copié', 'Le contenu a été copié dans le presse-papiers'),

    saveFailed: (error?: string) =>
      showErrorToast('Échec de l\'enregistrement', error || 'Impossible d\'enregistrer les modifications'),
    deleteFailed: (error?: string) =>
      showErrorToast('Échec de la suppression', error || 'Impossible de supprimer l\'élément'),
    updateFailed: (error?: string) =>
      showErrorToast('Échec de la mise à jour', error || 'Impossible de mettre à jour les informations'),
    loadFailed: (error?: string) =>
      showErrorToast('Échec du chargement', error || 'Impossible de charger les données'),

    networkError: () =>
      showErrorToast('Erreur réseau', 'Impossible de se connecter au serveur. Vérifiez votre connexion.'),
    permissionDenied: () =>
      showErrorToast('Accès refusé', 'Vous n\'avez pas les permissions nécessaires pour cette action'),
    serverError: () =>
      showErrorToast('Erreur serveur', 'Une erreur s\'est produite sur le serveur. Réessayez plus tard.'),
    validationError: (message?: string) =>
      showErrorToast('Erreur de validation', message || 'Les données fournies sont invalides'),
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show toast from error object
 */
export function showErrorFromException(error: unknown, fallbackMessage?: string) {
  if (error instanceof Error) {
    return showErrorToast('Erreur', error.message);
  }
  if (typeof error === 'string') {
    return showErrorToast('Erreur', error);
  }
  return showErrorToast('Erreur', fallbackMessage || 'Une erreur inattendue s\'est produite');
}

/**
 * Show toast for bulk action result
 */
export function showBulkActionResult(
  success: number,
  failed: number,
  actionName: string = 'action'
) {
  if (failed === 0) {
    return showSuccessToast(
      'Action groupée réussie',
      `${success} élément(s) traité(s) avec succès`
    );
  }
  return showWarningToast(
    'Action groupée partiellement réussie',
    `${success} réussi(s), ${failed} échec(s)`
  );
}

/**
 * Show toast for async operation
 */
export async function showToastForAsync<T>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading?: string;
    success: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  }
): Promise<T> {
  try {
    if (loading) {
      showInfoToast(loading);
    }

    const result = await promise;

    const successMessage = typeof success === 'function' ? success(result) : success;
    showSuccessToast(successMessage);

    return result;
  } catch (err) {
    const errorMessage =
      typeof error === 'function'
        ? error(err)
        : error || (err instanceof Error ? err.message : 'Une erreur s\'est produite');
    showErrorToast('Erreur', errorMessage);
    throw err;
  }
}

/**
 * Create custom toast (advanced usage)
 */
export function showCustomToast(options: ToastOptions) {
  return globalToast(options);
}
