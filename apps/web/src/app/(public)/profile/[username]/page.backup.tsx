import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDemoUserById } from '@/lib/demo/users';
import { BackButton } from './ProfileClient';
import { ProfileClientWrapper } from '@/components/profile/ProfileClientWrapper';

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
  // Préparer les traductions pour le client
  const translations = {
    subscribe: t('creator.subscribe'),
    message: t('creator.message'),
    tip: t('creator.tip'),
    followers: t('creator.followers'),
    subscriptions: t('creator.subscriptions'),
    popular: t('creator.popular'),
    perMonth: t('creator.perMonth'),
    tabAll: t('creator.tabs.all'),
    tabPhotos: t('creator.tabs.photos'),
    tabVideos: t('creator.tabs.videos'),
    tabFree: t('creator.tabs.free'),
    tabPaid: t('creator.tabs.paid'),
    locked: t('creator.locked'),
  };

  // ✅ Récupère le fan connecté (simulé pour demo)
  const currentUser = {
    id: 'fan-1',
    name: 'Moi',
    username: 'mon-pseudo',
    avatar: 'https://i.pravatar.cc/150?img=68',
  };

  return (
    <>
      <div className="mb-6 max-w-5xl mx-auto px-4 pt-6">
        <BackButton label={t('back')} />
      </div>
      <ProfileClientWrapper
        user={user}
        translations={translations}
        currentUser={currentUser}
      />
    </>
  );
}
