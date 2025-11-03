'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Shield,
  Heart,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import type {
  CreatorProfile,
  CreatorRevenue,
  CreatorSubscriber,
  CreatorContentStats,
  CreatorAnalytics,
} from '../_types/creator-types';

// ============================================
// PROPS INTERFACE
// ============================================
interface CreatorOverviewTabProps {
  profile: CreatorProfile;
  revenue: CreatorRevenue;
  recentSubscribers: CreatorSubscriber[];
  contentStats: CreatorContentStats;
  analytics: CreatorAnalytics;
  onTabChange?: (tab: string) => void;
}

export function CreatorOverviewTab({
  profile,
  revenue,
  recentSubscribers,
  contentStats,
  analytics,
  onTabChange,
}: CreatorOverviewTabProps) {
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [notes] = useState([
    {
      id: '1',
      content: 'Créatrice vérifiée avec excellent engagement. Contenu de qualité.',
      author: 'Admin Jean',
      date: new Date('2025-10-15'),
    },
  ]);

  // ============================================
  // HANDLERS (DEMO MODE)
  // ============================================

  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      alert('Veuillez saisir une note');
      return;
    }

    if (newNote.trim().length < 10) {
      alert('Note trop courte (min 10 caractères)');
      return;
    }

    setIsSavingNote(true);
    console.log('[DEMO] 💾 Saving note:', newNote);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert(`MODE DÉMO : Note enregistrée\n\n${newNote}`);
      setNewNote('');
    } finally {
      setIsSavingNote(false);
    }
  };

  const navigateToTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
      console.log('[DEMO] Navigation to tab:', tab);
    } else {
      alert(`MODE DÉMO : Navigation vers l'onglet ${tab}`);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getStatusBadge = () => {
    const config = {
      verified: { label: 'Vérifié', className: 'bg-green-50 text-green-700 border-green-200' },
      active: { label: 'Actif', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      suspended: { label: 'Suspendu', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      banned: { label: 'Banni', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    return config[profile.status] || config.active;
  };

  // Mock recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'content_published',
      description: 'Nouveau contenu publié : "Routine matinale fitness"',
      timestamp: new Date('2025-10-28T14:30:00'),
    },
    {
      id: '2',
      type: 'new_subscriber',
      description: 'Nouvel abonné Premium : Marc Dubois',
      timestamp: new Date('2025-10-27T10:15:00'),
    },
    {
      id: '3',
      type: 'revenue_received',
      description: 'Tip reçu de 50€ de Sophie Martin',
      timestamp: new Date('2025-10-25T16:20:00'),
    },
    {
      id: '4',
      type: 'marketplace_order',
      description: 'Commande marketplace finalisée',
      timestamp: new Date('2025-10-23T09:45:00'),
    },
    {
      id: '5',
      type: 'comment_received',
      description: '12 nouveaux commentaires sur contenus',
      timestamp: new Date('2025-10-22T18:30:00'),
    },
  ];

  const getActivityIcon = (type: string) => {
    const icons = {
      content_published: FileText,
      new_subscriber: Users,
      revenue_received: DollarSign,
      marketplace_order: ShoppingBag,
      comment_received: MessageCircle,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      content_published: 'text-blue-600 bg-blue-50',
      new_subscriber: 'text-green-600 bg-green-50',
      revenue_received: 'text-yellow-600 bg-yellow-50',
      marketplace_order: 'text-purple-600 bg-purple-50',
      comment_received: 'text-cyan-600 bg-cyan-50',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const totalActiveSubscribers = 
    revenue.subscriptionPlans.basic.count + 
    revenue.subscriptionPlans.vip.count + 
    revenue.subscriptionPlans.premium.count;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-3xl font-bold text-gray-900">€{revenue.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Depuis création</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscribers */}
        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abonnés actifs</p>
                <p className="text-3xl font-bold text-gray-900">{totalActiveSubscribers}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12 ce mois
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Published Content */}
        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contenus publiés</p>
                <p className="text-3xl font-bold text-gray-900">{contentStats.totalPublished}</p>
                <p className="text-xs text-gray-500 mt-1">{contentStats.totalPPV} PPV</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux engagement</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.averageEngagement}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Excellent
                </p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-full">
                <Heart className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-600" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Email</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{profile.email}</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Statut créateur</span>
              <Badge className={getStatusBadge().className}>{getStatusBadge().label}</Badge>
            </div>

            {profile.isVerified && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Badge vérifié</span>
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  Créateur vérifié
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Membre depuis</span>
              <span className="text-sm font-medium text-gray-900">
                {profile.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {profile.lastPublishedAt && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Dernière publication</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile.lastPublishedAt.toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Catégories</span>
              <div className="flex gap-1">
                {profile.categories.map((cat, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Alerts - Only show if there are issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Statut & Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Compte en règle</p>
                <p className="text-xs text-green-700 mt-1">Aucune sanction active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscribers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" />
              Abonnés récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubscribers.slice(0, 5).map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={subscriber.fanAvatar} />
                      <AvatarFallback>{subscriber.fanName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{subscriber.fanName}</p>
                      <p className="text-xs text-gray-500">
                        {subscriber.subscribedSince.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {subscriber.plan === 'basic' && 'Basic'}
                      {subscriber.plan === 'vip' && 'VIP'}
                      {subscriber.plan === 'premium' && 'Premium'}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">€{subscriber.pricePerMonth}/mois</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-600" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp.toLocaleDateString('fr-FR')} à{' '}
                        {activity.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes administratives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Notes */}
          {notes.length > 0 && (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-900">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="font-medium">{note.author}</span>
                    <span>•</span>
                    <span>{note.date.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Note */}
          <div className="space-y-3">
            <Textarea
              placeholder="Ajouter une note administrative..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {newNote.length} caractères {newNote.length > 0 && `(min 10)`}
              </p>
              <Button onClick={handleSaveNote} disabled={isSavingNote || newNote.trim().length < 10}>
                {isSavingNote ? 'Enregistrement...' : 'Enregistrer la note'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
