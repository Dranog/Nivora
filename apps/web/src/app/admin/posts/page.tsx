'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Image, Video, Lock, Eye, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Post {
  id: string;
  creator: string;
  content: string;
  type: 'Image' | 'Video' | 'Text' | 'Mixed';
  visibility: 'Public' | 'Subscribers' | 'PPV';
  price?: number;
  views: number;
  likes: number;
  status: 'Published' | 'Pending' | 'Flagged' | 'Removed';
  createdAt: string;
  flagReason?: string;
}

const DEMO_POSTS: Post[] = [
  {
    id: '1',
    creator: 'Sophie Martin',
    content: 'New photoshoot behind the scenes 📸',
    type: 'Image',
    visibility: 'Subscribers',
    views: 1245,
    likes: 342,
    status: 'Published',
    createdAt: '2024-01-22 14:30',
  },
  {
    id: '2',
    creator: 'Emma Wilson',
    content: 'Exclusive video content 🎥',
    type: 'Video',
    visibility: 'PPV',
    price: 9.99,
    views: 856,
    likes: 198,
    status: 'Published',
    createdAt: '2024-01-22 12:15',
  },
  {
    id: '3',
    creator: 'Lucas Dubois',
    content: 'Potentially inappropriate content',
    type: 'Image',
    visibility: 'Public',
    views: 2340,
    likes: 89,
    status: 'Flagged',
    createdAt: '2024-01-22 10:00',
    flagReason: 'Inappropriate Content',
  },
  {
    id: '4',
    creator: 'Julie Laurent',
    content: 'Workout routine video',
    type: 'Video',
    visibility: 'Public',
    views: 4521,
    likes: 678,
    status: 'Published',
    createdAt: '2024-01-21 18:45',
  },
  {
    id: '5',
    creator: 'Alexandre Rousseau',
    content: 'Premium content package',
    type: 'Mixed',
    visibility: 'PPV',
    price: 24.99,
    views: 432,
    likes: 145,
    status: 'Published',
    createdAt: '2024-01-21 16:20',
  },
  {
    id: '6',
    creator: 'Camille Moreau',
    content: 'Spam or scam content',
    type: 'Text',
    visibility: 'Public',
    views: 156,
    likes: 3,
    status: 'Flagged',
    createdAt: '2024-01-21 14:00',
    flagReason: 'Spam/Scam',
  },
  {
    id: '7',
    creator: 'Thomas Bernard',
    content: 'Removed for violating ToS',
    type: 'Video',
    visibility: 'Subscribers',
    views: 3421,
    likes: 234,
    status: 'Removed',
    createdAt: '2024-01-20 20:15',
    flagReason: 'Terms of Service Violation',
  },
  {
    id: '8',
    creator: 'Marie Petit',
    content: 'Awaiting moderation review',
    type: 'Image',
    visibility: 'PPV',
    price: 4.99,
    views: 0,
    likes: 0,
    status: 'Pending',
    createdAt: '2024-01-22 15:00',
  },
];

type TabType = 'all' | 'published' | 'pending' | 'flagged' | 'removed';

export default function PostsPage() {  const t = useTranslations('admin.posts');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  // Helper functions for translation
  function translateContentType(type: string): string {
    return t(`contentTypes.${type.toLowerCase()}`);
  }

  function translateVisibility(visibility: string): string {
    return t(`visibility.${visibility.toLowerCase()}`);
  }

  function translateStatus(status: string): string {
    return t(`statuses.${status.toLowerCase()}`);
  }

  const stats = {
    total: DEMO_POSTS.length,
    published: DEMO_POSTS.filter((p) => p.status === 'Published').length,
    pending: DEMO_POSTS.filter((p) => p.status === 'Pending').length,
    flagged: DEMO_POSTS.filter((p) => p.status === 'Flagged').length,
    removed: DEMO_POSTS.filter((p) => p.status === 'Removed').length,
  };

  const filteredPosts = DEMO_POSTS.filter((post) => {
    let tabMatch = true;
    if (activeTab === 'published') tabMatch = post.status === 'Published';
    if (activeTab === 'pending') tabMatch = post.status === 'Pending';
    if (activeTab === 'flagged') tabMatch = post.status === 'Flagged';
    if (activeTab === 'removed') tabMatch = post.status === 'Removed';

    const searchMatch =
      searchQuery === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.creator.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedPosts(checked ? filteredPosts.map((p) => p.id) : []);
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    setSelectedPosts(checked ? [...selectedPosts, postId] : selectedPosts.filter((id) => id !== postId));
  };

  const handleApproveSelected = () => {
    const plural = selectedPosts.length > 1 ? 's' : '';
    toast.success(t('toasts.postsApproved'), {
        description: t('toasts.postsApprovedMessage', { count: selectedPosts.length, plural
      }),
    });
    setSelectedPosts([]);
  };

  const handleRemoveSelected = () => {
    const plural = selectedPosts.length > 1 ? 's' : '';
    if (confirm(t('confirmations.removeSelected', { count: selectedPosts.length, plural }))) {
      toast.success(t('toasts.postsRemoved'), {
        description: t('toasts.postsRemovedMessage', { count: selectedPosts.length, plural
      }),
      });
      setSelectedPosts([]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Image':
        return <Image className="w-4 h-4" />;
      case 'Video':
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'Public':
        return 'bg-green-100 text-green-800';
      case 'Subscribers':
        return 'bg-blue-100 text-blue-800';
      case 'PPV':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Flagged':
        return 'bg-orange-100 text-orange-800';
      case 'Removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.total')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.published')}</div>
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.pending')}</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.flagged')}</div>
          <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.removed')}</div>
          <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label={t('search.ariaLabel')}
        />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: t('tabs.all') },
          { key: 'published', label: t('tabs.published') },
          { key: 'pending', label: t('tabs.pending') },
          { key: 'flagged', label: t('tabs.flagged') },
          { key: 'removed', label: t('tabs.removed') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#00B8A9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedPosts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">{selectedPosts.length} {t('bulk.selected')}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleApproveSelected}>
              {t('bulk.approve')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveSelected} className="text-red-600 hover:text-red-700">
              {t('bulk.remove')}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label={t('table.selectAll')}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.creator')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.content')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.type')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.visibility')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.stats')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.created')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={(checked) => handleSelectPost(post.id, checked as boolean)}
                    aria-label={t('table.selectPost', { creator: post.creator })}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{post.creator}</span>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm text-gray-900 truncate">{post.content}</div>
                  {post.flagReason && (
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      {post.flagReason}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {getTypeIcon(post.type)}
                    <span className="text-sm text-gray-600">{translateContentType(post.type)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getVisibilityColor(post.visibility)}>
                    {translateVisibility(post.visibility)}
                    {post.price && ` $${post.price}`}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views.toLocaleString()} {t('statsLabels.views')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{post.likes} {t('statsLabels.likes')}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(post.status)}>{translateStatus(post.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{post.createdAt}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {t('actions.view')}
                    </Button>
                    {post.status === 'Flagged' && (
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
