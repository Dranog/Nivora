'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LogIn,
  ShoppingCart,
  Crown,
  Heart,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { FanActivity, ActivityLog } from '../_types/fan-types';
import { ActivityDetailsModal } from '@/components/admin/modals/activity-details-modal';
import { generateFanActivity } from '../_data/fan-mock-data';

interface FanActivityTabProps {
  userId: string;
}

const ITEMS_PER_PAGE = 50;

export function FanActivityTab({ userId }: FanActivityTabProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [activity, setActivity] = useState<FanActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('📋 [FAN ACTIVITY] Loading activity for user:', userId);
    setIsLoading(true);

    // Simulate network delay
    const timer = setTimeout(() => {
      const data = generateFanActivity(userId, currentPage);
      setActivity(data);
      setIsLoading(false);
      console.log('✅ [FAN ACTIVITY] Activity loaded', data);
    }, 300);

    return () => clearTimeout(timer);
  }, [userId, currentPage]);

  if (isLoading || !activity) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  console.log('📋 [FAN ACTIVITY] Rendering activity tab');

  const getActivityIcon = (type: string) => {
    const icons = {
      login: LogIn,
      purchase: ShoppingCart,
      subscription: Crown,
      like: Heart,
      comment: MessageCircle,
      follow: UserPlus,
      report: AlertTriangle,
      view: Eye,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityBadge = (type: string) => {
    const config = {
      login: { label: 'Connexion', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      purchase: { label: 'Achat', className: 'bg-green-50 text-green-700 border-green-200' },
      subscription: { label: 'Abonnement', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      like: { label: 'Like', className: 'bg-pink-50 text-pink-700 border-pink-200' },
      comment: { label: 'Commentaire', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      follow: { label: 'Suivi', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      report: { label: 'Signalement', className: 'bg-red-50 text-red-700 border-red-200' },
      view: { label: 'Vue', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };
    return config[type as keyof typeof config] || config.login;
  };

  const filterByType = (logs: ActivityLog[]) => {
    if (selectedType === 'all') return logs;
    return logs.filter((log) => log.type === selectedType);
  };

  const filterByPeriod = (logs: ActivityLog[]) => {
    if (selectedPeriod === 'all') return logs;

    const now = new Date();
    const periodDays = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const days = periodDays[selectedPeriod as keyof typeof periodDays] || 0;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return logs.filter((log) => log.timestamp >= cutoffDate);
  };

  const filteredLogs = filterByPeriod(filterByType(activity.logs));
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('📄 [PAGINATION] Changed to page:', page);
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedActivity(log);
    console.log('🔍 [ACTIVITY DETAILS] Viewing activity:', log);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'activité
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="login">Connexions</SelectItem>
                  <SelectItem value="purchase">Achats</SelectItem>
                  <SelectItem value="subscription">Abonnements</SelectItem>
                  <SelectItem value="like">Likes</SelectItem>
                  <SelectItem value="comment">Commentaires</SelectItem>
                  <SelectItem value="follow">Suivis</SelectItem>
                  <SelectItem value="report">Signalements</SelectItem>
                  <SelectItem value="view">Vues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="24h">Dernières 24h</SelectItem>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                  <SelectItem value="90d">90 derniers jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <strong>{filteredLogs.length}</strong> activité{filteredLogs.length > 1 ? 's' : ''} trouvée{filteredLogs.length > 1 ? 's' : ''}
            </p>
            {(selectedType !== 'all' || selectedPeriod !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedPeriod('all');
                  setCurrentPage(1);
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Timeline d'activité</CardTitle>
            <Badge variant="outline" className="text-sm">
              Page {currentPage} / {totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {paginatedLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucune activité trouvée</p>
                <p className="text-sm">Essayez de modifier les filtres</p>
              </div>
            ) : (
              paginatedLogs.map((log) => {
                const activityConfig = getActivityBadge(log.type);
                const ActivityIcon = getActivityIcon(log.type);

                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 py-3 px-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => handleViewDetails(log)}
                  >
                    <div className={`p-2 rounded-md ${activityConfig.className.replace('text-', 'bg-').replace('border-', '')}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {activityConfig.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          •
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleDateString('fr-FR')} à{' '}
                          {log.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{log.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(log);
                      }}
                    >
                      Détails
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-10"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        open={selectedActivity !== null}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
        activity={selectedActivity}
        getTypeLabel={(type) => getActivityBadge(type).label}
        getTypeColor={(type) => getActivityBadge(type).className}
      />
    </div>
  );
}
