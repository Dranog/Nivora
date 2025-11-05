export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'ppv';
  mediaUrl?: string;
  mediaThumbnail?: string;
  isPPV?: boolean;
  ppvPrice?: number;
  ppvUnlocked?: boolean;
  timestamp: Date;
  isRead: boolean;
  reactions?: ('heart' | 'fire' | 'thumbs_up')[];
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  labels: ('vip' | 'top_fan' | 'new')[];
  totalSpent: number;
  allowsVideoCalls?: boolean; // ✅ Ajouté pour conditionner le bouton vidéo
}

export const demoConversations: Conversation[] = [
  {
    id: '1',
    participantId: '101',
    participantName: 'Jessica Lange',
    participantUsername: 'jessicalange',
    participantAvatar: 'https://i.pravatar.cc/150?img=47',
    isOnline: true,
    lastMessage: 'Merci pour ton abo...',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    unreadCount: 2,
    isPinned: true,
    isArchived: false,
    labels: ['vip', 'top_fan'],
    totalSpent: 450.00,
    allowsVideoCalls: true, // ✅ Créateur VIP autorise les appels vidéo
  },
  {
    id: '2',
    participantId: '102',
    participantName: 'Mark Meyer',
    participantUsername: 'markmeyer',
    participantAvatar: 'https://i.pravatar.cc/150?img=12',
    isOnline: false,
    lastSeen: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11h ago
    lastMessage: 'Nouveau contenu disponible',
    lastMessageTime: new Date(Date.now() - 11 * 60 * 60 * 1000),
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    labels: ['new'],
    totalSpent: 50.00,
    allowsVideoCalls: false, // ✅ Créateur basique n'autorise pas les appels vidéo
  },
  {
    id: '3',
    participantId: '103',
    participantName: 'Adam Perry',
    participantUsername: 'adamperry',
    participantAvatar: 'https://i.pravatar.cc/150?img=33',
    isOnline: false,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    lastMessage: 'Tu as aimé mon dernier post ?',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unreadCount: 1,
    isPinned: false,
    isArchived: false,
    labels: [],
    totalSpent: 120.00,
    allowsVideoCalls: false, // ✅ Créateur basique n'autorise pas les appels vidéo
  },
  {
    id: '4',
    participantId: '104',
    participantName: 'Sophie Martin',
    participantUsername: 'sophiemartin',
    participantAvatar: 'https://i.pravatar.cc/150?img=27',
    isOnline: true,
    lastMessage: 'À bientôt dans le live !',
    lastMessageTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    labels: ['top_fan'],
    totalSpent: 890.00,
    allowsVideoCalls: true, // ✅ Top fan autorise les appels vidéo
  },
];

export const demoMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      senderId: '101',
      senderName: 'Jessica Lange',
      senderAvatar: 'https://i.pravatar.cc/150?img=47',
      content: 'Salut !! Merci pour ton soutien 😊',
      type: 'text',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isRead: true,
      reactions: ['heart'],
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'me',
      senderName: 'Moi',
      senderAvatar: '',
      content: 'Avec plaisir, j\'adore ton contenu !',
      type: 'text',
      timestamp: new Date(Date.now() - 9 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: '101',
      senderName: 'Jessica Lange',
      senderAvatar: 'https://i.pravatar.cc/150?img=47',
      content: 'Ça me touche vraiment 💖',
      type: 'text',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      isRead: true,
      reactions: ['heart'],
    },
    {
      id: 'm4',
      conversationId: '1',
      senderId: 'me',
      senderName: 'Moi',
      senderAvatar: '',
      content: 'Tu vas publier bientôt ?',
      type: 'text',
      timestamp: new Date(Date.now() - 7 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'm5',
      conversationId: '1',
      senderId: '101',
      senderName: 'Jessica Lange',
      senderAvatar: 'https://i.pravatar.cc/150?img=47',
      content: 'Oui ! Nouveau post ce soir à 20h🔥',
      type: 'text',
      timestamp: new Date(Date.now() - 6 * 60 * 1000),
      isRead: true,
      reactions: ['fire'],
    },
    {
      id: 'm6',
      conversationId: '1',
      senderId: 'me',
      senderName: 'Moi',
      senderAvatar: '',
      content: 'Super ! Hâte de voir ça 🔥 👍',
      type: 'text',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'm7',
      conversationId: '1',
      senderId: '101',
      senderName: 'Jessica Lange',
      senderAvatar: 'https://i.pravatar.cc/150?img=47',
      content: 'Contenu exclusif pour toi 💎',
      type: 'ppv',
      mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
      mediaThumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&blur=10',
      isPPV: true,
      ppvPrice: 15.00,
      ppvUnlocked: false,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      isRead: false,
    },
  ],
};

// ✅ Fonction pour récupérer abonnements d'un fan
export function getUserSubscriptions(userId: string) {
  return [
    {
      creatorId: '101',
      creatorName: 'Jessica Lange',
      creatorUsername: 'jessicalange',
      creatorAvatar: 'https://i.pravatar.cc/150?img=47',
      tier: 'vip',
      totalSpent: 450.00,
    },
    {
      creatorId: '104',
      creatorName: 'Sophie Martin',
      creatorUsername: 'sophiemartin',
      creatorAvatar: 'https://i.pravatar.cc/150?img=27',
      tier: 'fan',
      totalSpent: 120.00,
    },
    {
      creatorId: '102',
      creatorName: 'Mark Meyer',
      creatorUsername: 'markmeyer',
      creatorAvatar: 'https://i.pravatar.cc/150?img=12',
      tier: 'fan',
      totalSpent: 50.00,
    },
  ];
}

// ✅ Fonction pour récupérer conversations d'un fan
export function getConversationsForUser(userId: string): Conversation[] {
  // Récupère les abonnements du fan
  const subscriptions = getUserSubscriptions(userId);

  // Crée une conversation pour chaque créateur auquel le fan est abonné
  return subscriptions.map((sub, index) => ({
    id: `conv-${sub.creatorId}`,
    participantId: sub.creatorId,
    participantName: sub.creatorName,
    participantUsername: sub.creatorUsername,
    participantAvatar: sub.creatorAvatar,
    isOnline: Math.random() > 0.5, // Random pour demo
    lastMessage: 'Merci pour ton soutien ! 💖',
    lastMessageTime: new Date(Date.now() - index * 60 * 60 * 1000),
    unreadCount: index === 0 ? 2 : 0,
    isPinned: index === 0,
    isArchived: false,
    labels: sub.tier === 'vip' ? ['vip', 'top_fan'] : [],
    totalSpent: sub.totalSpent || 0,
    allowsVideoCalls: sub.tier === 'vip', // ✅ Créateurs VIP autorisent les appels vidéo
  }));
}
