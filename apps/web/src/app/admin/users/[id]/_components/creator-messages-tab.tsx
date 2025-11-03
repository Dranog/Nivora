'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Users,
  Eye,
  XCircle,
  CheckCircle,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import type {
  CreatorConversation,
  CreatorMessagesStats,
} from '../_types/creator-types';

// ============================================
// PROPS INTERFACE
// ============================================
interface CreatorMessagesTabProps {
  conversations: CreatorConversation[];
  stats: CreatorMessagesStats;
}

export function CreatorMessagesTab({ conversations, stats }: CreatorMessagesTabProps) {
  const [conversationType, setConversationType] = useState<'all' | 'subscription' | 'marketplace'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('recent');

  // ============================================
  // FILTERING LOGIC
  // ============================================

  // Calculate counts per type
  const subscriptionCount = useMemo(
    () => conversations.filter((c) => c.type === 'subscription').length,
    [conversations]
  );
  const marketplaceCount = useMemo(
    () => conversations.filter((c) => c.type === 'marketplace').length,
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Filter by conversation type
    if (conversationType !== 'all') {
      filtered = filtered.filter((c) => c.type === conversationType);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((c) => c.severity === severityFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.fanName.toLowerCase().includes(query) ||
          c.fanId.toLowerCase().includes(query) ||
          c.lastMessagePreview.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.lastMessageAt.getTime() - b.lastMessageAt.getTime());
        break;
      case 'most_messages':
        filtered.sort((a, b) => b.messagesCount - a.messagesCount);
        break;
      default:
        break;
    }

    return filtered;
  }, [conversations, conversationType, severityFilter, searchQuery, sortBy]);

  const flaggedConversations = useMemo(() => {
    return conversations.filter((c) => c.flagsCount > 0);
  }, [conversations]);

  // ============================================
  // HANDLERS (DEMO MODE)
  // ============================================

  const handleViewConversation = async (conversationId: string, fanName: string) => {
    console.log('[DEMO] 👁️ Viewing conversation:', conversationId);
    alert(`MODE DÉMO : Consultation de la conversation avec ${fanName}`);
  };

  const handleCloseConversation = async (conversationId: string, fanName: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Fermer la conversation avec ${fanName} ?\n\n(Les modifications ne seront pas sauvegardées)`
    );
    if (!confirmed) return;

    console.log('[DEMO] 🔒 Closing conversation:', conversationId);
    alert(`MODE DÉMO : Conversation avec ${fanName} fermée`);
  };

  const handleReviewFlag = async (conversationId: string, fanName: string) => {
    console.log('[DEMO] 🔍 Reviewing flags for:', conversationId);
    alert(`MODE DÉMO : Examen des flags pour ${fanName}`);
  };

  const handleDismissFlag = async (conversationId: string, fanName: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Ignorer les flags pour ${fanName} ?\n\n(Les flags seront marqués comme faux positifs)`
    );
    if (!confirmed) return;

    console.log('[DEMO] ✓ Dismissing flags for:', conversationId);
    alert(`MODE DÉMO : Flags ignorés pour ${fanName}`);
  };

  const handleTakeAction = async (conversationId: string, fanName: string) => {
    console.log('[DEMO] ⚠️ Taking action for:', conversationId);
    alert(`MODE DÉMO : Actions disponibles pour ${fanName}`);
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'safe':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sécurisé
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Attention
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive" className="gap-1">
            <ShieldAlert className="h-3 w-3" />
            Critique
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* KPI CARDS */}
      {/* ============================================ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations actives</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">Avec réponse récente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages envoyés</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessagesSent}</div>
            <p className="text-xs text-muted-foreground mt-1">Depuis inscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flags détectés (IA)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flagsDetected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.flagsDetected > 0 ? 'Nécessite examen' : 'Aucun problème'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fans contactés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueFansContacted}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique fans</p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* AI FLAGS ALERT (if any) */}
      {/* ============================================ */}
      {flaggedConversations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <ShieldAlert className="h-5 w-5" />
              Détections IA : {flaggedConversations.length} conversation(s) signalée(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flaggedConversations.map((conv) => (
                <div key={conv.id} className="bg-white border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conv.fanAvatar} alt={conv.fanName} />
                        <AvatarFallback>{conv.fanName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{conv.fanName}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.messagesCount} messages · {formatDateTime(conv.lastMessageAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {conv.flagsCount} flag(s)
                    </Badge>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewFlag(conv.id, conv.fanName)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Examiner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissFlag(conv.id, conv.fanName)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ignorer (faux positif)
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTakeAction(conv.id, conv.fanName)}
                    >
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Prendre action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* FILTERS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <Input
                placeholder="Nom du fan, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Niveau de risque</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="safe">Sécurisé</SelectItem>
                  <SelectItem value="warning">Attention</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trier par</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Plus récent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="most_messages">Plus de messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* CONVERSATIONS LIST WITH INTERNAL TABS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations ({filteredConversations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={conversationType} onValueChange={(v) => setConversationType(v as typeof conversationType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">
                Tous ({conversations.length})
              </TabsTrigger>
              <TabsTrigger value="subscription">
                Abonnés ({subscriptionCount})
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                Marketplace ({marketplaceCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={conversationType} className="mt-0">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune conversation trouvée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        conv.flagsCount > 0 ? 'border-orange-200 bg-orange-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.fanAvatar} alt={conv.fanName} />
                            <AvatarFallback>{conv.fanName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{conv.fanName}</p>
                              {getSeverityBadge(conv.severity)}
                              {conv.flagsCount > 0 && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {conv.flagsCount}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{conv.messagesCount} messages</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(conv.lastMessageAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Last message preview */}
                      <div className="bg-gray-50 rounded p-2 mb-3">
                        <p className="text-sm text-muted-foreground italic line-clamp-2">
                          &ldquo;{conv.lastMessagePreview}&rdquo;
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewConversation(conv.id, conv.fanName)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir conversation
                        </Button>
                        {conv.flagsCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            onClick={() => handleReviewFlag(conv.id, conv.fanName)}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Examiner flags
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCloseConversation(conv.id, conv.fanName)}
                          className="ml-auto"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Fermer conversation
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* AI DETECTION INFO */}
      {/* ============================================ */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
            <ShieldAlert className="h-4 w-4" />
            Détection IA automatique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>Fonctionnement :</strong> Tous les messages sont analysés en temps réel par l&apos;IA
              pour détecter :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tentatives de contact externe (WhatsApp, Telegram, email, téléphone)</li>
              <li>Contenu inapproprié ou offensant</li>
              <li>Propositions de paiement hors plateforme</li>
              <li>Arnaque ou phishing</li>
              <li>Contenu NSFW ou explicite non autorisé</li>
            </ul>
            <p className="mt-3">
              <strong>Actions admin :</strong> Examiner les flags, valider ou ignorer les faux positifs,
              et prendre des mesures appropriées (avertissement, suspension, bannissement).
            </p>
            <p className="mt-3 text-xs">
              🎭 <strong>MODE DÉMO :</strong> Les actions ne modifient pas réellement les données.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
