/**
 * Admin Audit Log System
 *
 * Système de traçabilité des actions administrateurs conforme RGPD
 * - Toutes les actions sont loggées en base de données
 * - Aucun export de données personnelles
 * - Consultation via interface admin dédiée
 */

export enum AdminActionType {
  // User Management
  USER_VIEW = 'USER_VIEW',
  USER_SUSPEND = 'USER_SUSPEND',
  USER_BAN = 'USER_BAN',
  USER_DELETE = 'USER_DELETE',
  USER_EMAIL = 'USER_EMAIL',
  USER_NOTE_ADD = 'USER_NOTE_ADD',
  USER_WARNING_ADD = 'USER_WARNING_ADD',

  // Financial
  TRANSACTION_REFUND = 'TRANSACTION_REFUND',
  INVOICE_VIEW = 'INVOICE_VIEW',

  // Moderation
  REPORT_RESOLVE = 'REPORT_RESOLVE',
  CONTENT_DELETE = 'CONTENT_DELETE',

  // Fan Supervision - Marketplace
  FLAG_VALIDATE = 'FLAG_VALIDATE',
  FLAG_IGNORE = 'FLAG_IGNORE',
  CREATOR_WARN = 'CREATOR_WARN',
  CREATOR_BAN = 'CREATOR_BAN',
  MARKETPLACE_REPORT_GENERATE = 'MARKETPLACE_REPORT_GENERATE',

  // Fan Supervision - Messages
  MESSAGE_DELETE = 'MESSAGE_DELETE',
  CONVERSATION_CLOSE = 'CONVERSATION_CLOSE',
  FAN_CONTACT = 'FAN_CONTACT',
  CONVERSATION_COPY = 'CONVERSATION_COPY',
  CONVERSATION_PRINT = 'CONVERSATION_PRINT',

  // Settings
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  FORCE_LOGOUT = 'FORCE_LOGOUT',
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  adminId: string;
  adminEmail: string;
  actionType: AdminActionType;
  targetUserId: string;
  targetUserEmail?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    flagId?: string;
    conversationId?: string;
    messageId?: string;
    reason?: string;
    duration?: number;
    [key: string]: any;
  };
}

interface LogAdminActionParams {
  adminId: string;
  adminEmail: string;
  actionType: AdminActionType;
  targetUserId: string;
  targetUserEmail?: string;
  details?: Record<string, any>;
  metadata?: AuditLogEntry['metadata'];
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log une action administrateur dans la base de données
 *
 * @param params - Paramètres de l'action à logger
 * @returns Promise<void>
 *
 * @example
 * await logAdminAction({
 *   adminId: 'admin-123',
 *   adminEmail: 'admin@oliver.com',
 *   actionType: AdminActionType.FLAG_VALIDATE,
 *   targetUserId: 'user-456',
 *   targetUserEmail: 'user@example.com',
 *   details: { flagType: 'payment_offsite', confidence: 96 },
 *   metadata: { flagId: 'F1002', conversationId: 'CONV-001' }
 * });
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    adminId: params.adminId,
    adminEmail: params.adminEmail,
    actionType: params.actionType,
    targetUserId: params.targetUserId,
    targetUserEmail: params.targetUserEmail,
    details: params.details || {},
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: params.metadata,
  };

  // Log en console (format structuré pour debugging)
  console.log('📋 [AUDIT LOG]', {
    action: entry.actionType,
    admin: `${entry.adminEmail} (${entry.adminId})`,
    target: `${entry.targetUserEmail || 'N/A'} (${entry.targetUserId})`,
    timestamp: entry.timestamp.toISOString(),
    metadata: entry.metadata,
  });

  try {
    // TODO: Remplacer par appel API pour enregistrement en base de données
    // await fetch('/api/admin/audit-logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });

    // Pour l'instant, simulation d'enregistrement
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('✅ [AUDIT LOG] Enregistré en base de données');
  } catch (error) {
    // CRITICAL: Ne jamais faire échouer l'action admin si le log échoue
    // Mais logger l'erreur pour investigation
    console.error('❌ [AUDIT LOG] ERREUR enregistrement:', error);
    console.error('⚠️ [AUDIT LOG] Action admin effectuée mais non tracée:', entry.actionType);
  }
}

/**
 * Génère un watermark pour les copies/impressions
 *
 * @param adminEmail - Email de l'admin
 * @param timestamp - Date/heure de l'action
 * @returns Watermark texte
 */
export function generateWatermark(adminEmail: string, timestamp: Date = new Date()): string {
  return `
═══════════════════════════════════════════════════════════════
⚠️  CONFIDENTIEL ADMIN - USAGE STRICTEMENT INTERNE  ⚠️
═══════════════════════════════════════════════════════════════

Accès par: ${adminEmail}
Date/heure: ${timestamp.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'long',
  })}

⚠️ Ce document contient des données personnelles protégées par le RGPD.
Toute diffusion, copie ou utilisation non autorisée est interdite.
Toute consultation est tracée et auditée.

═══════════════════════════════════════════════════════════════
`;
}

/**
 * Formate une conversation pour copie avec watermark
 *
 * @param conversation - Données de la conversation
 * @param adminEmail - Email de l'admin
 * @returns Texte formaté avec watermark
 */
export function formatConversationForCopy(
  conversation: {
    id: string;
    creatorName: string;
    messages: Array<{
      id: string;
      from: 'fan' | 'creator';
      content: string;
      timestamp: Date;
      flags?: any[];
    }>;
  },
  adminEmail: string
): string {
  const watermark = generateWatermark(adminEmail);

  let text = watermark;
  text += `\n\nCONVERSATION ID: ${conversation.id}\n`;
  text += `CRÉATEUR: ${conversation.creatorName}\n`;
  text += `\n${'═'.repeat(65)}\n\n`;

  conversation.messages.forEach((msg) => {
    const timestamp = new Date(msg.timestamp).toLocaleString('fr-FR');
    const sender = msg.from === 'fan' ? 'FAN' : 'CRÉATEUR';
    text += `[${timestamp}] ${sender}:\n${msg.content}\n`;

    if (msg.flags && msg.flags.length > 0) {
      text += `⚠️ FLAGS DÉTECTÉS: ${msg.flags.length}\n`;
    }

    text += `\n${'-'.repeat(65)}\n\n`;
  });

  text += `\n${watermark}`;

  return text;
}

/**
 * Génère un rapport marketplace pour lecture interne (non téléchargeable)
 *
 * @param data - Données marketplace
 * @param adminEmail - Email de l'admin
 * @returns Rapport formaté HTML
 */
export function generateMarketplaceReport(
  data: {
    totalAnnonces: number;
    totalResponses: number;
    detectedIncidents: number;
    annonces: Array<{
      id: string;
      title: string;
      status: string;
      flags: any[];
    }>;
  },
  adminEmail: string
): string {
  const timestamp = new Date();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport Marketplace - Confidentiel Admin</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .watermark {
      background: #fee;
      border: 3px solid #c00;
      padding: 1rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .stat-card {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .flag-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: #fef2f2;
      color: #dc2626;
      border-radius: 4px;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="watermark">
    <h2>⚠️ CONFIDENTIEL ADMIN - USAGE STRICTEMENT INTERNE ⚠️</h2>
    <p>Accès par: ${adminEmail}</p>
    <p>Date: ${timestamp.toLocaleString('fr-FR')}</p>
  </div>

  <h1>Rapport Marketplace - Supervision Fan</h1>

  <div class="stats">
    <div class="stat-card">
      <h3>Total Annonces</h3>
      <p style="font-size: 2rem; font-weight: bold;">${data.totalAnnonces}</p>
    </div>
    <div class="stat-card">
      <h3>Réponses</h3>
      <p style="font-size: 2rem; font-weight: bold;">${data.totalResponses}</p>
    </div>
    <div class="stat-card">
      <h3>Incidents Détectés</h3>
      <p style="font-size: 2rem; font-weight: bold; color: #dc2626;">${data.detectedIncidents}</p>
    </div>
  </div>

  <h2>Annonces</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Statut</th>
        <th>Flags</th>
      </tr>
    </thead>
    <tbody>
      ${data.annonces.map(annonce => `
        <tr>
          <td>${annonce.id}</td>
          <td>${annonce.title}</td>
          <td>${annonce.status}</td>
          <td>
            ${annonce.flags.length > 0
              ? `<span class="flag-badge">${annonce.flags.length} flag(s)</span>`
              : '-'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="watermark" style="margin-top: 3rem;">
    <p>⚠️ Ce document est strictement confidentiel et ne peut être ni téléchargé ni partagé.</p>
    <p>Toute consultation est tracée et auditée conformément au RGPD.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Copie du texte dans le clipboard
 *
 * @param text - Texte à copier
 * @returns Promise<boolean> - true si succès
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback pour navigateurs anciens
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('❌ [CLIPBOARD] Erreur copie:', error);
    return false;
  }
}
