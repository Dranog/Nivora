/**
 * Centralized demo content data for users
 * Shared between public profile and admin panel
 */

export interface DemoPost {
  id: string;
  userId: string;
  type: 'photo' | 'video' | 'text';
  title: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
  createdAt: Date;
}

export interface UserContentStats {
  userId: string;
  totalPosts: number;
  totalPhotos: number;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  publicPosts: number;
  privatePosts: number;
}

// Generate consistent content for a user based on their ID
export function generateUserContent(userId: string, userRole: string): DemoPost[] {
  const seed = parseInt(userId) || 1;
  const posts: DemoPost[] = [];

  // Only creators have content
  if (userRole !== 'Creator') {
    return [];
  }

  // Generate posts based on user ID for consistency
  const postCount = Math.floor(seed * 3 + 12); // 15-48 posts

  for (let i = 0; i < postCount; i++) {
    const type: 'photo' | 'video' | 'text' =
      i % 5 === 0 ? 'video' :
      i % 3 === 0 ? 'text' :
      'photo';

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    posts.push({
      id: `post_${userId}_${i}`,
      userId,
      type,
      title: `Post ${i + 1} - ${type === 'photo' ? 'Photo' : type === 'video' ? 'Vidéo' : 'Texte'}`,
      description: `Description du contenu ${i + 1}`,
      mediaUrl: type === 'text' ? undefined : `https://picsum.photos/seed/${userId}-${i}/800/600`,
      thumbnailUrl: type === 'video' ? `https://picsum.photos/seed/${userId}-${i}/400/300` : undefined,
      likes: Math.floor((seed + i) * 12 + Math.random() * 100),
      comments: Math.floor((seed + i) * 3 + Math.random() * 20),
      views: Math.floor((seed + i) * 50 + Math.random() * 500),
      isPublic: i % 3 !== 0, // 2/3 public, 1/3 private
      createdAt: date,
    });
  }

  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Calculate content stats for a user
export function getUserContentStats(userId: string, userRole: string): UserContentStats {
  const content = generateUserContent(userId, userRole);

  const totalPhotos = content.filter(p => p.type === 'photo').length;
  const totalVideos = content.filter(p => p.type === 'video').length;
  const publicPosts = content.filter(p => p.isPublic).length;
  const privatePosts = content.filter(p => !p.isPublic).length;

  const totalViews = content.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = content.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = content.reduce((sum, p) => sum + p.comments, 0);

  return {
    userId,
    totalPosts: content.length,
    totalPhotos,
    totalVideos,
    totalViews,
    totalLikes,
    totalComments,
    publicPosts,
    privatePosts,
  };
}

// Get recent content (for display)
export function getRecentUserContent(userId: string, userRole: string, limit = 10): DemoPost[] {
  const content = generateUserContent(userId, userRole);
  return content.slice(0, limit);
}

// Get user subscriptions (for fans)
export interface UserSubscription {
  id: string;
  userId: string; // fan userId
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  subscribedAt: Date;
  status: 'active' | 'expired' | 'cancelled';
  monthlyPrice: number;
}

export function getUserSubscriptions(userId: string): UserSubscription[] {
  const seed = parseInt(userId) || 1;
  const subscriptions: UserSubscription[] = [];

  // Generate 2-5 subscriptions for fans
  const count = Math.floor(seed * 0.5 + 2);

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));

    subscriptions.push({
      id: `sub_${userId}_${i}`,
      userId,
      creatorId: `${(seed + i) % 10 + 2}`,
      creatorName: `Creator ${i + 1}`,
      creatorHandle: `creator-${i + 1}`,
      creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Creator${i}`,
      subscribedAt: date,
      status: i === 0 ? 'active' : Math.random() > 0.3 ? 'active' : 'expired',
      monthlyPrice: [9.99, 14.99, 19.99, 29.99][i % 4],
    });
  }

  return subscriptions.sort((a, b) => b.subscribedAt.getTime() - a.subscribedAt.getTime());
}

console.log('📦 [CONTENT] Content data module loaded');
