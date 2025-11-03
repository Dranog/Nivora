'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Flag,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  Mail,
  Lock,
  Copy,
  Printer,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import type { MessagesData, Conversation, Message, Flag as FlagType } from '../_types/fan-supervision-types';
import {
  logAdminAction,
  AdminActionType,
  formatConversationForCopy,
  copyToClipboard,
} from '@/lib/audit-log';
import { useFanMessages } from '../_hooks/useFanData';
import { adminToasts } from '@/lib/toasts';

interface FanMessagesTabProps {
  userId: string;
}

export function FanMessagesTab({ userId }: FanMessagesTabProps) {
  const [conversationType, setConversationType] = useState<'all' | 'subscription' | 'marketplace'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch messages data
  const { data: messagesData, isLoading, error } = useFanMessages(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !messagesData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des messages</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const data = messagesData;
  const conversationMessages: Record<string, Message[]> = {}; // TODO: Get from messagesData if available

  // Filter conversations by type
  const filteredConversations = useMemo(() => {
    if (conversationType === 'all') return data.conversations;
    return data.conversations.filter((c) => c.type === conversationType);
  }, [data.conversations, conversationType]);

  // Calculate counts per type
  const subscriptionCount = useMemo(
    () => data.conversations.filter((c) => c.type === 'subscription').length,
    [data.conversations]
  );
  const marketplaceCount = useMemo(
    () => data.conversations.filter((c) => c.type === 'marketplace').length,
    [data.conversations]
  );

  const getSeverityBadge = (severity: string) => {
    const config = {
      critical: { label: 'Critique', className: 'bg-red-100 text-red-700 border-red-300', icon: '🔴' },
      warning: { label: 'Attention', className: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🟠' },
      safe: { label: 'Sain', className: 'bg-green-100 text-green-700 border-green-300', icon: '🟢' },
    };
    return config[severity as keyof typeof config] || config.safe;
  };

  const getFlagSeverityColor = (severity: string) => {
    return severity === 'critical'
      ? 'bg-red-50 border-red-300'
      : severity === 'warning'
      ? 'bg-orange-50 border-orange-300'
      : 'bg-blue-50 border-blue-300';
  };

  const handleViewConversation = (conversationId: string) => {
    setSelectedConversation(selectedConversation === conversationId ? null : conversationId);
    const msgCount = conversationMessages[conversationId]?.length || 0;
    adminToasts.general.info(`Affichage de ${msgCount} messages`);
  };

  const handleValidateFlag = async (flagId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      adminToasts.general.success('Flag validé - Action automatique déclenchée');
    } catch (error) {
      adminToasts.general.error('Erreur lors de la validation du flag');
    }
  };

  const handleIgnoreFlag = async (flagId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      adminToasts.general.info('Flag ignoré - IA mise à jour');
    } catch (error) {
      adminToasts.general.error('Erreur lors de l\'ignorance du flag');
    }
  };

  const handleWarnCreator = async (creatorId: string, creatorName: string) => {
    const confirmed = window.confirm(`Envoyer un avertissement à ${creatorName} ?`);
    if (!confirmed) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      adminToasts.general.warning(`Avertissement envoyé à ${creatorName}`);
    } catch (error) {
      adminToasts.general.error('Erreur lors de l\'envoi de l\'avertissement');
    }
  };

  const handleBanCreator = async (creatorId: string, creatorName: string) => {
    const confirmation = window.prompt(
      `⚠️ ATTENTION: Pour bannir ${creatorName}, tapez "BANNIR":`
    );

    if (confirmation !== 'BANNIR') {
      adminToasts.general.error('Bannissement annulé');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      adminToasts.general.error(`${creatorName} a été banni définitivement`);
    } catch (error) {
      adminToasts.general.error('Erreur lors du bannissement');
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage || !deleteReason.trim()) {
      adminToasts.general.error('Raison requise (min 10 caractères)');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      adminToasts.general.success('Message supprimé');
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedMessage(null);
    } catch (error) {
      adminToasts.general.error('Erreur lors de la suppression');
    }
  };

  const handleContactFan = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      adminToasts.general.error('Sujet et message requis');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      adminToasts.general.success('Email de prévention envoyé au fan');
      setShowContactModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      adminToasts.general.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation || !closeReason.trim()) {
      adminToasts.general.error('Raison requise (min 10 caractères)');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      adminToasts.general.warning('Conversation fermée - Futurs messages bloqués');
      setShowCloseModal(false);
      setCloseReason('');
      setSelectedConversation(null);
    } catch (error) {
      adminToasts.general.error('Erreur lors de la fermeture');
    }
  };

  const handleCopyConversation = async (conversationId: string) => {
    try {
      const conversation = data.conversations.find(c => c.id === conversationId);
      const messages = conversationMessages[conversationId] || [];

      if (!conversation) {
        adminToasts.general.error('Conversation introuvable');
        return;
      }

      // Formater la conversation avec watermark admin
      const formattedText = formatConversationForCopy(
        {
          id: conversation.id,
          creatorName: conversation.creatorName,
          messages: messages,
        },
        'admin@oliver.com' // TODO: Récupérer email admin réel
      );

      // Copier dans le clipboard
      const success = await copyToClipboard(formattedText);

      if (success) {
        // Log l'action en audit
        await logAdminAction({
          adminId: 'ADMIN-TEMP', // TODO: Récupérer ID admin réel
          adminEmail: 'admin@oliver.com',
          actionType: AdminActionType.CONVERSATION_COPY,
          targetUserId: userId,
          details: {
            conversationId,
            messagesCount: messages.length,
            hasWatermark: true,
          },
          metadata: { conversationId },
        });

        adminToasts.general.success('Conversation copiée avec watermark CONFIDENTIEL ADMIN');
        adminToasts.general.info('La copie contient un watermark de traçabilité');
      } else {
        adminToasts.general.error('Erreur lors de la copie dans le presse-papiers');
      }
    } catch (error) {
      adminToasts.general.error('Erreur lors de la copie');
    }
  };

  const handlePrintConversation = async (conversationId: string) => {
    try {
      const conversation = data.conversations.find(c => c.id === conversationId);
      const messages = conversationMessages[conversationId] || [];

      if (!conversation) {
        adminToasts.general.error('Conversation introuvable');
        return;
      }

      // Log l'action en audit
      await logAdminAction({
        adminId: 'ADMIN-TEMP', // TODO: Récupérer ID admin réel
        adminEmail: 'admin@oliver.com',
        actionType: AdminActionType.CONVERSATION_PRINT,
        targetUserId: userId,
        details: {
          conversationId,
          messagesCount: messages.length,
          hasWatermark: true,
        },
        metadata: { conversationId },
      });

      // Créer une fenêtre d'impression avec watermark
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        adminToasts.general.error('Impossible d\'ouvrir la fenêtre d\'impression (popup bloqué?)');
        return;
      }

      const timestamp = new Date().toLocaleString('fr-FR');
      const watermark = `
⚠️ CONFIDENTIEL ADMIN - USAGE STRICTEMENT INTERNE ⚠️
Accès par: admin@oliver.com | Date: ${timestamp}
      `.trim();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Conversation ${conversationId} - CONFIDENTIEL</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            .watermark {
              background: #fee;
              border: 3px solid #c00;
              padding: 1rem;
              margin-bottom: 2rem;
              text-align: center;
              font-weight: bold;
            }
            .message {
              padding: 1rem;
              margin: 1rem 0;
              border-radius: 8px;
              background: #f9f9f9;
            }
            .message-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
              color: #666;
            }
            .flag {
              background: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 0.5rem;
              margin-top: 0.5rem;
              font-size: 0.875rem;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">
            ${watermark}
          </div>

          <h1>Conversation ${conversationId}</h1>
          <p><strong>Créateur:</strong> ${conversation.creatorName}</p>
          <p><strong>Messages:</strong> ${messages.length}</p>

          <hr style="margin: 2rem 0;" />

          ${messages.map(msg => `
            <div class="message">
              <div class="message-header">
                <strong>${msg.from === 'fan' ? 'FAN' : 'CRÉATEUR'}</strong>
                <span>${new Date(msg.timestamp).toLocaleString('fr-FR')}</span>
              </div>
              <div>${msg.content}</div>
              ${msg.flags && msg.flags.length > 0 ? `
                <div class="flag">
                  ⚠️ ${msg.flags.length} flag(s) détecté(s) par l'IA
                </div>
              ` : ''}
            </div>
          `).join('')}

          <div class="watermark" style="margin-top: 3rem;">
            <p>⚠️ Ce document est strictement confidentiel.</p>
            <p>Toute impression est tracée et auditée conformément au RGPD.</p>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Délai pour permettre le chargement avant d'ouvrir le dialog d'impression
      setTimeout(() => {
        printWindow.print();
      }, 250);

      adminToasts.general.success('Fenêtre d\'impression ouverte');
      adminToasts.general.info('L\'impression contient un watermark de traçabilité');
    } catch (error) {
      adminToasts.general.error('Erreur lors de l\'impression');
    }
  };

  const selectedConvData = data.conversations.find(c => c.id === selectedConversation);
  const messages = selectedConversation ? conversationMessages[selectedConversation] || [] : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Conversations actives</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalConversations}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Messages échangés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalMessages}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Flags détectés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.detectedFlags}</p>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Interventions admin</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.adminInterventions}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List with Internal Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations du fan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={conversationType} onValueChange={(v) => setConversationType(v as typeof conversationType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">
                Tous ({data.totalConversations})
              </TabsTrigger>
              <TabsTrigger value="subscription">
                Abonnements ({subscriptionCount})
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                Marketplace ({marketplaceCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={conversationType} className="mt-0">
              <div className="space-y-3">
                {filteredConversations.map((conversation) => {
              const severityConfig = getSeverityBadge(conversation.severity);
              const isExpanded = selectedConversation === conversation.id;

              return (
                <div key={conversation.id}>
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      conversation.severity === 'critical'
                        ? 'border-red-300 bg-red-50'
                        : conversation.severity === 'warning'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleViewConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.creatorAvatar} />
                        <AvatarFallback>{conversation.creatorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{conversation.creatorName}</span>
                          <span className="text-xs text-gray-500">@{conversation.creatorHandle}</span>
                          <Badge className={severityConfig.className}>
                            {severityConfig.icon} {severityConfig.label}
                          </Badge>
                          {conversation.flags.length > 0 && (
                            <Badge className="bg-red-100 text-red-700 border-red-300">
                              <Flag className="w-3 h-3 mr-1" />
                              {conversation.flags.length} flag{conversation.flags.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {conversation.severity === 'critical' && (
                            <Badge className="bg-red-600 text-white animate-pulse">
                              URGENT
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>💬 {conversation.messagesCount} messages</span>
                          <span>🕐 {conversation.lastMessageAt.toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {isExpanded ? 'Masquer' : 'Lire'}
                      </Button>
                    </div>
                  </div>

                  {/* Conversation Messages */}
                  {isExpanded && (
                    <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Timeline de conversation</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowContactModal(true)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Contacter fan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyConversation(conversation.id)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintConversation(conversation.id)}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setShowCloseModal(true)}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Fermer
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.from === 'fan'
                                ? 'bg-blue-50 border border-blue-200 ml-8'
                                : 'bg-gray-50 border border-gray-200 mr-8'
                            } ${message.flags.length > 0 ? 'ring-2 ring-red-400' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">
                                  {message.from === 'fan' ? '👤 Fan' : '🎨 Créateur'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {message.timestamp.toLocaleDateString('fr-FR')} à{' '}
                                  {message.timestamp.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.read && <Badge className="text-xs">Lu</Badge>}
                                {message.deleted && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">Supprimé</Badge>
                                )}
                              </div>
                              {message.flags.length === 0 && message.from === 'creator' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-900">{message.content}</p>

                            {/* Message Flags */}
                            {message.flags.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {message.flags.map((flag) => (
                                  <div
                                    key={flag.id}
                                    className={`p-3 border-2 rounded ${getFlagSeverityColor(flag.severity)}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <AlertTriangle className="w-4 h-4 text-red-600" />
                                          <span className="font-bold text-sm text-red-900">
                                            FLAG #{flag.id}
                                          </span>
                                          <Badge className="bg-red-600 text-white text-xs">
                                            {flag.severity.toUpperCase()}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {flag.confidence}% confiance
                                          </Badge>
                                        </div>
                                        <p className="text-sm font-medium mb-1">
                                          Type: {flag.type.replace('_', ' ').toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-700">
                                          Mots-clés détectés: <strong>{flag.keywords.join(', ')}</strong>
                                        </p>
                                        <p className="text-xs text-gray-700 mt-1">
                                          Recommandations: {flag.recommendations.join(' • ')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-300">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleValidateFlag(flag.id)}
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Valider
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleIgnoreFlag(flag.id)}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Ignorer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-orange-600"
                                        onClick={() =>
                                          handleWarnCreator(conversation.creatorId, conversation.creatorName)
                                        }
                                      >
                                        <Shield className="w-3 h-3 mr-1" />
                                        Warn créateur
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() =>
                                          handleBanCreator(conversation.creatorId, conversation.creatorName)
                                        }
                                      >
                                        <Ban className="w-3 h-3 mr-1" />
                                        Ban créateur
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Detection Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Derniers flags générés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentFlags.map((flag) => (
                <div key={flag.id} className={`p-3 border rounded ${getFlagSeverityColor(flag.severity)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {flag.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <Badge className="text-xs">{flag.confidence}%</Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {flag.detectedAt.toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Précision IA:</span>
                <span className="text-2xl font-bold text-green-600">{data.aiStats.accuracy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Détections totales:</span>
                <span className="font-semibold">{data.aiStats.totalDetections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Flags validés:</span>
                <span className="font-semibold text-green-600">{data.aiStats.validatedFlags}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Flags ignorés:</span>
                <span className="font-semibold text-gray-600">{data.aiStats.ignoredFlags}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Fan Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Contacter le fan (prévention)
            </DialogTitle>
            <DialogDescription>
              Envoyer un email de prévention au fan concernant les tentatives de contact hors plateforme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sujet *</label>
              <Input
                placeholder="Ex: Tentative de contact externe détectée"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message *</label>
              <Textarea
                placeholder="Expliquez la situation et les risques..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleContactFan} disabled={!emailSubject.trim() || emailMessage.length < 20}>
              Envoyer l'email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Conversation Modal */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Fermer la conversation
            </DialogTitle>
            <DialogDescription>
              Cette action bloquera les futurs messages entre le fan et le créateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Raison de la fermeture *</label>
              <Textarea
                placeholder="Expliquez pourquoi vous fermez cette conversation..."
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-900">
                ⚠️ Les deux participants seront notifiés de la fermeture
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCloseConversation}
              disabled={closeReason.length < 10}
              className="bg-red-600 hover:bg-red-700"
            >
              Fermer la conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Message Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Supprimer le message
            </DialogTitle>
            <DialogDescription>
              Le message sera masqué de la conversation mais restera dans les logs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMessage && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <p className="text-sm text-gray-900">{selectedMessage.content}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Raison de la suppression *</label>
              <Textarea
                placeholder="Expliquez pourquoi vous supprimez ce message..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleDeleteMessage}
              disabled={deleteReason.length < 10}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer le message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
