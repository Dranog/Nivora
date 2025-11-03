export interface DemoUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar?: string;
  role: 'Admin' | 'Creator' | 'User';
  status: 'Verified' | 'Pending' | 'Rejected' | 'Suspended';
  emailVerified?: boolean;
  accountAge: string;
  lastLogin: string;
  totalRevenue?: number;
  subscriberCount?: number;
  category?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  kycStatus?: 'Approved' | 'Pending' | 'Rejected' | 'NotSubmitted';
  totalPostCount?: number;
  publicPostCount?: number;
  privatePostCount?: number;
  messagesSentCount?: number;
  messagesReceivedCount?: number;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    name: 'Alliso Pan',
    email: 'alliso.pan@ac.acc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alliso',
    role: 'Admin',
    status: 'Verified',
    accountAge: '2 years',
    lastLogin: '2 years ago',
    handle: 'alliso-pan',
    emailVerified: true,
  },
  {
    id: '2',
    name: 'Jon Kelly',
    email: 'jon.kelly@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jon',
    role: 'Creator',
    status: 'Verified',
    accountAge: '1 year',
    lastLogin: '2 hours ago',
    handle: 'jon-kelly',
    emailVerified: true,
    totalRevenue: 39248,
    subscriberCount: 3524,
    category: 'Fitness',
    bio: 'Fitness coach & nutrition expert 💪 Helping you achieve your fitness goals! 🔥 Personal training • Meal plans • Motivation',
    location: 'Los Angeles, CA',
    websiteUrl: 'https://jonkelly.fit',
    instagramHandle: '@jonkelly_fit',
    kycStatus: 'Approved',
    totalPostCount: 146,
    publicPostCount: 80,
    privatePostCount: 66,
  },
  {
    id: '3',
    name: 'Robert Fox',
    email: 'robert.fox@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    role: 'User',
    status: 'Verified',
    accountAge: '2 years ago',
    lastLogin: '2 days ago',
    handle: 'robert-fox',
    emailVerified: true,
  },
  {
    id: '4',
    name: 'Tom Smitt',
    email: 'tom.sm@aiyz.dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    role: 'User',
    status: 'Verified',
    accountAge: '3 months',
    lastLogin: '14 days ago',
    handle: 'tom-smitt',
    emailVerified: false,
  },
  {
    id: '5',
    name: 'David Jvan',
    email: 'david.jvan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'User',
    status: 'Verified', // ✅ SOURCE VÉRITÉ (not Pending)
    accountAge: '8 days',
    lastLogin: '3 days ago',
    handle: 'david-jvan',
    emailVerified: true,
    kycStatus: 'Approved',
  },
  {
    id: '6',
    name: 'Robert Fox',
    email: 'robert.fox2@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RFox2',
    role: 'User',
    status: 'Rejected',
    accountAge: '2 days ago',
    lastLogin: '1 year ago',
    handle: 'robert-fox2',
  },
  {
    id: '7',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'Creator',
    status: 'Verified',
    accountAge: '1 year',
    lastLogin: '5 hours ago',
    handle: 'sarah-johnson',
    emailVerified: true,
    totalRevenue: 12500,
    subscriberCount: 850,
    category: 'Lifestyle',
    bio: '✨ Lifestyle blogger • Fashion enthusiast • Travel lover 🌍 Sharing my daily adventures and style tips!',
    location: 'New York, NY',
    instagramHandle: '@sarahjohnson',
    kycStatus: 'Approved',
    totalPostCount: 89,
    publicPostCount: 55,
    privatePostCount: 34,
  },
  {
    id: '8',
    name: 'Michael Brown',
    email: 'mbrown@test.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    role: 'User',
    status: 'Verified',
    accountAge: '6 months',
    lastLogin: '1 week ago',
    handle: 'michael-brown',
    emailVerified: true,
  },
  {
    id: '9',
    name: 'Emma Wilson',
    email: 'emma.w@mail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    role: 'Admin',
    status: 'Verified',
    accountAge: '3 years',
    lastLogin: '2 hours ago',
    handle: 'emma-wilson',
    emailVerified: true,
  },
  {
    id: '10',
    name: 'James Taylor',
    email: 'jtaylor@company.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    role: 'Creator',
    status: 'Pending',
    accountAge: '1 month',
    lastLogin: '4 days ago',
    handle: 'james-taylor',
    totalRevenue: 0,
    subscriberCount: 0,
    kycStatus: 'Pending',
  },
  {
    id: '11',
    name: 'Lisa Anderson',
    email: 'lisa.a@domain.net',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    role: 'User',
    status: 'Suspended',
    accountAge: '8 months',
    lastLogin: '2 months ago',
    handle: 'lisa-anderson',
  },
  {
    id: '12',
    name: 'Chris Martinez',
    email: 'chris.m@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    role: 'Creator',
    status: 'Verified',
    accountAge: '1 year',
    lastLogin: '1 day ago',
    handle: 'chris-martinez',
    emailVerified: true,
    totalRevenue: 28400,
    subscriberCount: 1240,
    category: 'Gaming',
    bio: '🎮 Professional gamer & streamer | FPS specialist | Tournament winner 🏆 Daily gaming content & tips',
    location: 'Miami, FL',
    twitterHandle: '@chrismart_gaming',
    tiktokHandle: '@chrisgaming',
    kycStatus: 'Approved',
    totalPostCount: 124,
    publicPostCount: 75,
    privatePostCount: 49,
  },
  {
    id: '13',
    name: 'Anna Davis',
    email: 'anna.davis@web.org',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    role: 'User',
    status: 'Verified',
    accountAge: '5 months',
    lastLogin: '3 weeks ago',
    handle: 'anna-davis',
    emailVerified: true,
  },
  {
    id: '14',
    name: 'Daniel White',
    email: 'd.white@service.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    role: 'Admin',
    status: 'Verified',
    accountAge: '2 years',
    lastLogin: '30 minutes ago',
    handle: 'daniel-white',
    emailVerified: true,
  },
  {
    id: '15',
    name: 'Sophie Clark',
    email: 'sophie.c@platform.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    role: 'Creator',
    status: 'Pending',
    accountAge: '2 weeks',
    lastLogin: '6 hours ago',
    handle: 'sophie-clark',
    kycStatus: 'Pending',
  },
  {
    id: '16',
    name: 'Mark Johnson',
    email: 'mark.j@banned.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    role: 'User',
    status: 'Rejected',
    accountAge: '6 months',
    lastLogin: '3 months ago',
    handle: 'mark-johnson',
  },
  {
    id: '17',
    name: 'Laura Smith',
    email: 'laura.s@banned.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    role: 'Creator',
    status: 'Rejected',
    accountAge: '1 year',
    lastLogin: '6 months ago',
    handle: 'laura-smith',
  },
  {
    id: '100',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'Creator',
    status: 'Verified',
    accountAge: '1 year 9 months',
    lastLogin: '1 hour ago',
    handle: 'sarah-johnson',
    emailVerified: true,
    totalRevenue: 12450,
    subscriberCount: 156,
    category: 'Fitness',
    bio: 'Fitness, Wellness & Nutrition coach 🧘‍♀️ Certified personal trainer • Healthy recipes • Mindful living',
    location: 'San Francisco, CA',
    websiteUrl: 'https://sarahjohnson.fit',
    instagramHandle: '@sarah_johnson_fit',
    kycStatus: 'Approved',
    totalPostCount: 65,
    publicPostCount: 53,
    privatePostCount: 12,
  },
];

// Helper to get user by ID
export function getDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

// Helper to get user by handle
export function getDemoUserByHandle(handle: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.handle === handle);
}

// Helper to get status label
export function getStatusLabel(status: DemoUser['status']): string {
  const labels: Record<DemoUser['status'], string> = {
    Verified: 'Vérifié',
    Pending: 'En attente',
    Suspended: 'Suspendu',
    Rejected: 'Banni',
  };
  return labels[status];
}

// Helper to get status color classes
export function getStatusColor(status: DemoUser['status']): string {
  const colors: Record<DemoUser['status'], string> = {
    Verified: 'text-green-600 bg-green-50 border-green-200',
    Pending: 'text-orange-600 bg-orange-50 border-orange-200',
    Suspended: 'text-orange-600 bg-orange-50 border-orange-200',
    Rejected: 'text-red-600 bg-red-50 border-red-200',
  };
  return colors[status];
}

// Helper to get role label
export function getRoleLabel(role: DemoUser['role']): string {
  const labels: Record<DemoUser['role'], string> = {
    Admin: 'Admin',
    Creator: 'Créateur',
    User: 'Fan',
  };
  return labels[role];
}
