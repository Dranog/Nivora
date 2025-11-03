'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Eye,
  Heart,
  MessageCircle,
  Archive,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  Search,
} from 'lucide-react';
import type { CreatorContent, CreatorContentStats, ContentType, ContentStatus } from '../_types/creator-types';

// ============================================
// PROPS INTERFACE
// ============================================
interface CreatorContentTabProps {
  contents: CreatorContent[];
  stats: CreatorContentStats;
}

export function CreatorContentTab({ contents, stats }: CreatorContentTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort contents
  const filteredContents = useMemo(() => {
    let filtered = [...contents];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => c.title.toLowerCase().includes(query) || c.id.toLowerCase().includes(query));
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = a.publishedAt?.getTime() || 0;
          const dateB = b.publishedAt?.getTime() || 0;
          return dateB - dateA;
        });
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.publishedAt?.getTime() || 0;
          const dateB = b.publishedAt?.getTime() || 0;
          return dateA - dateB;
        });
        break;
    }

    return filtered;
  }, [contents, statusFilter, typeFilter, sortBy, searchQuery]);

  const handleViewContent = (content: CreatorContent) => {
    console.log('[DEMO] 👁️ Viewing content:', content.id);
    alert(`MODE DÉMO : Ouverture contenu "${content.title}"`);
  };

  const handleEditContent = async (contentId: string, title: string) => {
    console.log('[DEMO] ✏️ Editing content:', contentId);
    alert(`MODE DÉMO : Modification contenu "${title}"`);
  };

  const handleArchiveContent = async (contentId: string, title: string) => {
    const confirmed = window.confirm(
      `MODE DÉMO : Archiver le contenu "${title}" ?\n\n(Les modifications ne seront pas sauvegardées)`
    );

    if (!confirmed) return;

    console.log('[DEMO] 📦 Archiving content:', contentId);
    alert(`MODE DÉMO : Contenu "${title}" archivé`);
  };

  const handleDeleteContent = async (contentId: string, title: string) => {
    const confirmation = window.prompt(
      `MODE DÉMO : Supprimer le contenu "${title}" ?\n\nTapez "SUPPRIMER" pour confirmer :`
    );

    if (confirmation !== 'SUPPRIMER') {
      alert('Suppression annulée');
      return;
    }

    console.log('[DEMO] 🗑️ Deleting content:', contentId);
    alert(`MODE DÉMO : Contenu "${title}" supprimé`);
  };

  const getContentIcon = (type: ContentType) => {
    const icons = {
      video: Video,
      photo: ImageIcon,
      audio: Music,
      text: FileText,
    };
    return icons[type] || FileText;
  };

  const getContentTypeColor = (type: ContentType) => {
    const colors = {
      video: 'text-red-600 bg-red-50',
      photo: 'text-purple-600 bg-purple-50',
      audio: 'text-blue-600 bg-blue-50',
      text: 'text-gray-600 bg-gray-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getStatusBadge = (status: ContentStatus) => {
    const config = {
      published: { label: 'Publié', className: 'bg-green-50 text-green-700 border-green-200' },
      ppv: { label: 'PPV', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      draft: { label: 'Brouillon', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      archived: { label: 'Archivé', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    };
    return config[status] || config.published;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contenus publiés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPublished}</p>
                <p className="text-xs text-gray-500 mt-1">En ligne</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contenus PPV</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPPV}</p>
                <p className="text-xs text-gray-500 mt-1">Payants</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contenus gratuits</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFree}</p>
                <p className="text-xs text-gray-500 mt-1">Inclus abonnement</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Brouillons</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDrafts}</p>
                <p className="text-xs text-gray-500 mt-1">Non publiés</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-full">
                <Edit className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <CardTitle>Contenus ({filteredContents.length})</CardTitle>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un contenu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="ppv">PPV</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="views">Plus de vues</SelectItem>
                  <SelectItem value="likes">Plus de likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun contenu trouvé</p>
              <p className="text-sm text-gray-500 mt-1">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Contenu</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Vues</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Likes</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Commentaires</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContents.map((content) => {
                    const ContentIcon = getContentIcon(content.type);
                    const typeColor = getContentTypeColor(content.type);
                    const statusBadge = getStatusBadge(content.status);

                    return (
                      <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${typeColor}`}>
                              <ContentIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{content.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">ID: {content.id}</span>
                                {content.isPPV && content.ppvPrice && (
                                  <Badge variant="outline" className="text-xs">
                                    €{content.ppvPrice}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-xs capitalize">
                            {content.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">{content.views.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-pink-600">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">{content.likes.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-600">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{content.comments.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {content.publishedAt ? (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                {content.publishedAt.toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewContent(content)}
                              title="Voir le contenu"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditContent(content.id, content.title)}
                              title="Modifier (DEMO)"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {content.status !== 'archived' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleArchiveContent(content.id, content.title)}
                                title="Archiver (DEMO)"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteContent(content.id, content.title)}
                              title="Supprimer (DEMO)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DEMO Badge */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            🎭 <strong>MODE DÉMO :</strong> Les actions (éditer, archiver, supprimer) ne modifient pas réellement les données.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
