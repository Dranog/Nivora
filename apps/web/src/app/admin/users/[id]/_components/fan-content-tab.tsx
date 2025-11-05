'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart,
  Users,
  Crown,
  Lock,
  Star,
  Eye,
  Calendar,
  Play,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import type { FanContent } from '../_types/fan-types';
import { generateFanContent } from '../_data/fan-mock-data';

interface FanContentTabProps {
  userId: string;
}

export function FanContentTab({ userId }: FanContentTabProps) {
  const [selectedTab, setSelectedTab] = useState<'followed' | 'subscriptions' | 'ppv' | 'favorites' | 'history'>('followed');
  const [content, setContent] = useState<FanContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🎬 [FAN CONTENT] Loading content for user:', userId);
    setIsLoading(true);

    // Simulate network delay
    const timer = setTimeout(() => {
      const data = generateFanContent(userId);
      setContent(data);
      setIsLoading(false);
      console.log('✅ [FAN CONTENT] Content loaded', data);
    }, 300);

    return () => clearTimeout(timer);
  }, [userId]);

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  console.log('🎬 [FAN CONTENT] Rendering content tab');

  const getContentTypeIcon = (type: string) => {
    const icons = {
      image: ImageIcon,
      video: Film,
      album: Play,
    };
    return icons[type as keyof typeof icons] || Film;
  };

  const getContentTypeBadge = (type: string) => {
    const config = {
      image: { label: 'Image', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      video: { label: 'Vidéo', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      album: { label: 'Album', className: 'bg-pink-50 text-pink-700 border-pink-200' },
    };
    return config[type as keyof typeof config] || config.video;
  };

  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Créateurs suivis</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {content.followedCreators.length}
                </p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-full">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Abonnements actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {content.activeSubscriptions.length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-pink-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contenus PPV</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {content.ppvLibrary.length}
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-full">
                <Lock className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Favoris</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {content.favorites.length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contenu et créateurs</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTab === 'followed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('followed')}
              >
                <Users className="w-4 h-4 mr-2" />
                Suivis
              </Button>
              <Button
                variant={selectedTab === 'subscriptions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('subscriptions')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Abonnements
              </Button>
              <Button
                variant={selectedTab === 'ppv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('ppv')}
              >
                <Lock className="w-4 h-4 mr-2" />
                PPV
              </Button>
              <Button
                variant={selectedTab === 'favorites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('favorites')}
              >
                <Star className="w-4 h-4 mr-2" />
                Favoris
              </Button>
              <Button
                variant={selectedTab === 'history' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('history')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Historique
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Followed Creators */}
          {selectedTab === 'followed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.followedCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={creator.creatorAvatar} />
                      <AvatarFallback>{creator.creatorName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{creator.creatorName}</p>
                      <p className="text-sm text-gray-500">@{creator.creatorHandle}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Suivi depuis le {creator.followedAt.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {creator.isSubscribed && (
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Abonné
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Active Subscriptions */}
          {selectedTab === 'subscriptions' && (
            <div className="space-y-4">
              {content.activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 border-2 border-purple-200 bg-purple-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 ring-2 ring-purple-600">
                        <AvatarImage src={sub.creatorAvatar} />
                        <AvatarFallback>{sub.creatorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 p-1 bg-purple-600 rounded-full">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{sub.creatorName}</p>
                      <p className="text-sm text-gray-600">@{sub.creatorHandle}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                          {sub.plan}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Depuis le {sub.startDate.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-700">€{sub.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">par mois</p>
                    {sub.nextBilling && (
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Renouvellement: {sub.nextBilling.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <Badge
                      className={
                        sub.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200 mt-2'
                          : 'bg-gray-50 text-gray-700 border-gray-200 mt-2'
                      }
                    >
                      {sub.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PPV Library */}
          {selectedTab === 'ppv' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.ppvLibrary.map((item) => {
                const typeConfig = getContentTypeBadge(item.type);
                const TypeIcon = getContentTypeIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={typeConfig.className}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-pink-600 text-white border-pink-700">
                          <Lock className="w-3 h-3 mr-1" />
                          PPV
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.creatorName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-pink-600">€{item.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">
                          {item.purchaseDate.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Favorites */}
          {selectedTab === 'favorites' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={fav.thumbnail}
                      alt={fav.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="p-2 bg-yellow-500 rounded-full">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{fav.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{fav.creatorName}</p>
                    <p className="text-xs text-gray-500">
                      Ajouté le {fav.addedAt.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View History */}
          {selectedTab === 'history' && (
            <div className="space-y-3">
              {content.viewHistory.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="relative">
                    <img
                      src={view.contentThumbnail}
                      alt={view.contentTitle}
                      className="w-32 h-20 object-cover rounded"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 rounded text-xs text-white">
                      {Math.floor(view.duration / 60)}:{(view.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{view.contentTitle}</h4>
                    <p className="text-sm text-gray-600 mb-2">{view.creatorName}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progression</span>
                          <span>{formatProgress(view.progress)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-cyan-600 h-1.5 rounded-full"
                            style={{ width: `${view.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {view.viewedAt.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
