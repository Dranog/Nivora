import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, DollarSign, Instagram, Twitter, Youtube, Check, Lock, Play, Star } from 'lucide-react';
import { BackButton } from './ProfileClient';
import { getDemoUserById } from '@/lib/demo/users';

function getUserByUsername(username: string) {
  const usernameMap: Record<string, string> = {
    'alliso-pan': '1',
    'jon-kelly': '2',
    'robert-fox': '3',
    'tom-smitt': '4',
    'david-ivan': '6',
    'sarah-johnson': '7',
    'michael-brown': '8',
    'emma-wilson': '9',
    'lisa-anderson': '10',
  };

  const userId = usernameMap[username];
  if (!userId) return null;

  // Get user from the same source as admin
  const adminUser = getDemoUserById(userId);
  if (!adminUser) return null;

  console.log('🖼️ [PUBLIC PROFILE] Loading user:', {
    userId,
    username,
    name: adminUser.name,
    avatar: adminUser.avatar,
    avatarSource: 'From admin user database (getDemoUserById)',
  });

  const seed = parseInt(userId) * 100;

  // Map admin user to public profile format
  const user = {
    id: adminUser.id,
    name: adminUser.name,
    username: adminUser.handle,
    email: adminUser.email,
    role: adminUser.role.toLowerCase(),
    avatar: adminUser.avatar, // Use the same avatar as admin
  };

  // Données pour fans (simple)
  const fanData = user.role !== 'creator' ? {
    subscriptions: [
      {
        id: '1',
        creatorName: 'Jon Kelly',
        creatorUsername: 'jon-kelly',
        creatorAvatar: getDemoUserById('2')?.avatar || '',
        plan: '€9.99/mois',
        status: 'active',
        since: '15/03/2024',
        nextBilling: '15/11/2024',
      },
      {
        id: '2',
        creatorName: 'Sarah Johnson',
        creatorUsername: 'sarah-johnson',
        creatorAvatar: getDemoUserById('7')?.avatar || '',
        plan: '€19.99/mois',
        status: 'active',
        since: '01/05/2024',
        nextBilling: '01/11/2024',
      },
    ],
    purchases: [
      { id: '1', date: '28/10/2024', description: 'Abonnement @jon-kelly', amount: 9.99, status: 'completed' },
      { id: '2', date: '25/10/2024', description: 'Tip @sarah-johnson', amount: 5.00, status: 'completed' },
      { id: '3', date: '20/10/2024', description: 'PPV Content', amount: 15.00, status: 'completed' },
    ],
    stats: {
      totalSpent: 234.50,
      subscriptions: 2,
      likedPosts: 156,
      memberSince: '2 ans',
    },
  } : null;

  // Données pour créateurs (premium)
  const creatorData = user.role === 'creator' ? {
    bio: 'Fitness coach & nutrition expert 💪 Helping you achieve your goals 🔥 Join my journey to wellness ⭐',
    socials: {
      instagram: username.replace('-', ''),
      twitter: username.replace('-', ''),
      youtube: username.replace('-', ''),
    },
    stats: {
      followers: 1234 + (seed % 5000),
      likes: 56000 + (seed % 20000),
      posts: 234 + (seed % 100),
    },
    subscriptionTiers: [
      {
        id: 'fan',
        name: 'Fan',
        price: 9.99,
        popular: false,
        features: [
          'Accès à tous les posts publics',
          'Accès aux posts privés niveau Fan',
          'Messages illimités',
        ],
      },
      {
        id: 'vip',
        name: 'VIP Tutorial',
        price: 19.99,
        popular: true,
        features: [
          'Tout de Fan +',
          'Accès aux posts privés niveau VIP',
          'Messages prioritaires',
          'Contenu exclusif hebdomadaire',
        ],
      },
      {
        id: 'exclusive',
        name: 'Q&A Session',
        price: 49.99,
        popular: false,
        features: [
          'Tout de VIP +',
          'Session Q&A mensuelle privée',
          'Coaching personnalisé',
          'Vidéos call 1-to-1',
        ],
      },
    ],
    content: [
      {
        id: '1',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        title: 'Morning Routine',
        tier: 'free',
        locked: false,
        likes: 234,
        comments: 45,
      },
      {
        id: '2',
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
        title: 'VIP Tutorial',
        tier: 'vip',
        locked: true,
        likes: 567,
        comments: 89,
      },
      {
        id: '3',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
        title: 'Advanced Technique',
        tier: 'vip',
        locked: true,
        price: 15,
        likes: 432,
        comments: 67,
      },
      {
        id: '4',
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop',
        title: 'Workout Tips',
        tier: 'free',
        locked: false,
        likes: 789,
        comments: 123,
      },
      {
        id: '5',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop',
        title: 'Nutrition Guide',
        tier: 'fan',
        locked: true,
        likes: 345,
        comments: 56,
      },
      {
        id: '6',
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=400&h=400&fit=crop',
        title: 'Stretching Session',
        tier: 'free',
        locked: false,
        likes: 456,
        comments: 78,
      },
    ],
    isVerified: true,
  } : null;

  console.log('✅ [PUBLIC PROFILE] Avatar synchronized:', {
    avatar: user.avatar,
    message: 'Using same avatar as admin panel',
  });

  return {
    ...user,
    // avatar already set from adminUser.avatar - do not override
    ...fanData,
    ...creatorData,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations('profile');
  const username = resolvedParams.username;

  const user = getUserByUsername(username);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{t('notFound.title')}</h1>
          <p className="text-xl text-gray-600">{t('notFound.description')}</p>
          <BackButton label={t('back')} />
        </div>
      </div>
    );
  }

  // Design simple pour fans
  if (user.role !== 'creator') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton label={t('back')} />
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-600">@{user.username}</p>
                <Badge className="mt-2">{t('roles.fan')}</Badge>
              </div>
            </div>
            {user.stats && 'totalSpent' in user.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t('stats.totalSpent')}</p>
                  <p className="text-2xl font-bold">€{user.stats.totalSpent}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t('stats.subscriptions')}</p>
                  <p className="text-2xl font-bold">{user.stats.subscriptions}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t('stats.likedPosts')}</p>
                  <p className="text-2xl font-bold">{user.stats.likedPosts}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t('stats.memberSince')}</p>
                  <p className="text-2xl font-bold">{user.stats.memberSince}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Design premium pour créateurs
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec dégradé */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-48" />

      <div className="max-w-5xl mx-auto px-4 -mt-32 pb-12">
        <div className="mb-6">
          <BackButton label={t('back')} />
        </div>

        {/* Photo profil + infos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-xl" />
              {user.isVerified && (
                <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1.5">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              {user.isVerified && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white mb-2">
                  <Star className="w-3 h-3 mr-1" />
                  Gold Creator
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 text-lg">@{user.username}</p>

              {user.bio && (
                <p className="text-gray-700 mt-4">{user.bio}</p>
              )}

              {/* Réseaux sociaux */}
              {user.socials && (
                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" size="sm" className="text-pink-600">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-500">
                    <Twitter className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Youtube className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Stats */}
              {user.stats && 'followers' in user.stats && (
                <div className="flex gap-8 mt-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{user.stats.followers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{t('creator.followers')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{user.stats.likes.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{user.stats.posts}</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-3 mt-6">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  + {t('creator.subscribe')}
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('creator.message')}
                </Button>
                <Button variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t('creator.tip')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Abonnements */}
        {user.subscriptionTiers && user.subscriptionTiers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('creator.subscriptions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user.subscriptionTiers.map((tier) => (
              <Card key={tier.id} className={`p-6 relative ${tier.popular ? 'border-2 border-cyan-500' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    {t('creator.popular')}
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold text-cyan-600 mb-4">
                  €{tier.price}<span className="text-sm text-gray-600">{t('creator.perMonth')}</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${tier.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white' : ''}`}>
                  {t('creator.subscribe')}
                </Button>
              </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="all">{t('creator.tabs.all')}</TabsTrigger>
              <TabsTrigger value="photos">{t('creator.tabs.photos')}</TabsTrigger>
              <TabsTrigger value="videos">{t('creator.tabs.videos')}</TabsTrigger>
              <TabsTrigger value="free">{t('creator.tabs.free')}</TabsTrigger>
              <TabsTrigger value="paid">{t('creator.tabs.paid')}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.content && user.content.map((item) => (
                  <div key={item.id} className="relative group cursor-pointer rounded-lg overflow-hidden">
                    <img src={item.thumbnail} alt={item.title} className="w-full aspect-square object-cover" />

                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white font-semibold mb-2">{item.title}</p>
                      <div className="flex gap-4 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {item.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {item.comments}
                        </div>
                      </div>
                    </div>

                    {/* Badge type */}
                    {item.type === 'video' && (
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Contenu verrouillé */}
                    {item.locked && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="w-8 h-8 mx-auto mb-2" />
                          {item.price ? (
                            <p className="font-bold">€{item.price}</p>
                          ) : (
                            <p className="text-sm">{t('creator.locked')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
