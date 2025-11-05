'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  DollarSign,
  Instagram,
  Twitter,
  Youtube,
  Play,
  Lock,
  Check,
  Star,
  Bell,
  Search,
  Grid3x3,
  Video as VideoIcon,
  Image as ImageIcon,
  User,
  ArrowLeft,
} from 'lucide-react';
import { MessagingPanel } from '@/components/messaging/MessagingPanel';
import { getConversationsForUser } from '@/lib/demo/messages';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProfileClientWrapper({ user, translations, currentUser }: any) {
  const router = useRouter();
  const [showMessages, setShowMessages] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ✅ ACTION: S'abonner
  const handleSubscribe = () => {
    if (isSubscribed) {
      toast.success('✅ Vous êtes déjà abonné à ' + user.name);
      return;
    }

    // Simuler un abonnement
    setIsSubscribed(true);
    toast.success('🎉 Vous êtes maintenant abonné à ' + user.name + ' !');
  };

  // ✅ ACTION: Envoyer un tip
  const handleTip = () => {
    toast.info('💰 Fenêtre de pourboire (à implémenter)');
    // TODO: Ouvrir modal de tip
  };

  // ✅ ACTION: Naviguer vers réseau social
  const handleSocialClick = (platform: 'instagram' | 'twitter' | 'youtube') => {
    const urls = {
      instagram: `https://instagram.com/${user.username}`,
      twitter: `https://twitter.com/${user.username}`,
      youtube: `https://youtube.com/@${user.username}`,
    };
    window.open(urls[platform], '_blank');
  };

  // ✅ ACTION: Retour page précédente
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER BANNER */}
      <div className="relative h-64 bg-gradient-to-r from-cyan-500 to-blue-500">
        <div className="absolute top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo CLIQUABLE */}
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-white hover:opacity-80 transition-opacity"
            >
              OLIVER
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const query = (e.target as any).search.value;
                  if (query) router.push(`/search?q=${query}`);
                }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    name="search"
                    placeholder="Rechercher"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/90 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </form>
            </div>

            {/* Notifs + Avatar CLIQUABLES */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/notifications')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => router.push('/profile/me')}
                className="w-10 h-10 rounded-full bg-white/20 border-2 border-white hover:bg-white/30 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bouton RETOUR */}
        <button
          onClick={handleBack}
          className="absolute top-24 left-6 z-50 flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>
      </div>

      {/* LAYOUT PRINCIPAL: SIDEBAR + CONTENT */}
      <div className="container mx-auto px-6 -mt-32 pb-12">
        <div className="grid grid-cols-12 gap-8">

          {/* ═══════════════════════════════════════════════════
             SIDEBAR GAUCHE (STICKY)
          ═══════════════════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">

              {/* CARD PROFIL */}
              <Card className="p-6 bg-white shadow-xl rounded-2xl">
                {/* Avatar */}
                <div className="flex flex-col items-center -mt-20 mb-6">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-full border-6 border-white shadow-2xl object-cover"
                    />
                    {user.isVerified && (
                      <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1.5">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {user.isVerified && (
                    <Badge className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 text-sm font-bold">
                      🏅 Gold Creator
                    </Badge>
                  )}
                </div>

                {/* Nom + Username */}
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.name}
                  </h1>
                  <p className="text-gray-500 text-base">
                    @{user.username}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1 434</p>
                    <p className="text-xs text-gray-600">Abonnés</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">56 200</p>
                    <p className="text-xs text-gray-600">Likes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">234</p>
                    <p className="text-xs text-gray-600">Posts</p>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-center text-gray-700 text-sm leading-relaxed mb-6">
                    {user.bio}
                  </p>
                )}

                {/* Socials CLIQUABLES */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button
                    onClick={() => handleSocialClick('instagram')}
                    className="p-2 hover:bg-pink-50 rounded-full transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </button>
                  <button
                    onClick={() => handleSocialClick('twitter')}
                    className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleSocialClick('youtube')}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                {/* Boutons CTA FONCTIONNELS */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSubscribe}
                    disabled={isSubscribed}
                    className={cn(
                      'w-full py-6 text-base font-semibold shadow-lg',
                      isSubscribed
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                    )}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    {isSubscribed ? '✓ Abonné' : '+ S\'abonner'}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowMessages(true)}
                      className="py-6"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Message
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleTip}
                      className="py-6"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Tip
                    </Button>
                  </div>
                </div>
              </Card>

              {/* CARD ABONNEMENTS CLIQUABLES */}
              <Card className="p-6 bg-white shadow-xl rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Abonnements
                </h3>

                <div className="space-y-4">
                  {[
                    { id: 'fan', name: 'Fan', price: 9.99, description: 'Accès de base', popular: false },
                    { id: 'vip', name: 'VIP Tutorial', price: 19.99, description: 'Accès premium', popular: true },
                    { id: 'qna', name: 'Q&A Session', price: 49.99, description: 'Accès complet', popular: false },
                  ].map((tier) => (
                    <div
                      key={tier.id}
                      className={cn(
                        'p-4 border-2 rounded-xl cursor-pointer transition-all',
                        tier.popular
                          ? 'border-cyan-500 bg-cyan-50 relative'
                          : 'border-gray-200 hover:border-cyan-500'
                      )}
                    >
                      {tier.popular && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                          🔥 Plus populaire
                        </Badge>
                      )}

                      <div className="flex items-center justify-between mb-2 mt-2">
                        <span className="font-bold text-gray-900">{tier.name}</span>
                        <span className="text-lg font-bold text-cyan-600">
                          €{tier.price.toFixed(2)}
                          <span className="text-xs text-gray-500">/mois</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{tier.description}</p>

                      <Button
                        onClick={() => {
                          toast.success(`🎉 Abonnement ${tier.name} activé !`);
                          setIsSubscribed(true);
                        }}
                        className={cn(
                          'w-full text-sm',
                          tier.popular
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                        )}
                      >
                        S'abonner
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
             CONTENU PRINCIPAL (SCROLLABLE)
          ═══════════════════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="bg-white shadow-xl rounded-2xl overflow-hidden">

              {/* TABS NAVIGATION */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200 px-6">
                  <TabsList className="w-full justify-start bg-transparent border-0 p-0 h-auto">
                    <TabsTrigger
                      value="posts"
                      className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-500 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none px-6 py-4 text-base font-semibold"
                    >
                      <Grid3x3 className="w-5 h-5 mr-2" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      value="photos"
                      className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-500 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none px-6 py-4 text-base font-semibold"
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Photos
                    </TabsTrigger>
                    <TabsTrigger
                      value="videos"
                      className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-500 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none px-6 py-4 text-base font-semibold"
                    >
                      <VideoIcon className="w-5 h-5 mr-2" />
                      Vidéos
                    </TabsTrigger>
                    <TabsTrigger
                      value="about"
                      className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-500 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none px-6 py-4 text-base font-semibold"
                    >
                      <User className="w-5 h-5 mr-2" />
                      À propos
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* POSTS TAB */}
                <TabsContent value="posts" className="p-6 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Post 1 - Free CLIQUABLE */}
                    <button
                      onClick={() => router.push(`/profile/${user.username}/post/1`)}
                      className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square text-left"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"
                        alt="Morning Routine"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <p className="font-semibold mb-2">Morning Routine</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              234
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              45
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Post 2 - PPV Locked CLIQUABLE */}
                    <button
                      onClick={() => {
                        toast.info('💎 Débloquez ce contenu pour €15');
                      }}
                      className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600"
                        alt="Locked content"
                        className="w-full h-full object-cover blur-sm"
                      />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <Lock className="w-8 h-8 text-white mb-3" />
                        <p className="text-white font-bold text-lg">€15</p>
                        <Badge className="mt-2 bg-cyan-500 text-white">VIP</Badge>
                      </div>
                    </button>

                    {/* Post 3 - PPV Locked CLIQUABLE */}
                    <button
                      onClick={() => {
                        toast.info('🔒 Abonnement requis pour débloquer ce contenu');
                      }}
                      className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"
                        alt="Locked content"
                        className="w-full h-full object-cover blur-sm"
                      />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <Lock className="w-8 h-8 text-white mb-3" />
                        <p className="text-white font-bold text-lg">Abonnement requis</p>
                      </div>
                    </button>

                    {/* Post 4 - Free CLIQUABLE */}
                    <button
                      onClick={() => router.push(`/profile/${user.username}/post/4`)}
                      className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square text-left"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600"
                        alt="Workout Tips"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <p className="font-semibold mb-2">Workout Tips</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              789
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              123
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </TabsContent>

                {/* PHOTOS TAB */}
                <TabsContent value="photos" className="p-6 m-0">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                </TabsContent>

                {/* VIDEOS TAB */}
                <TabsContent value="videos" className="p-6 m-0">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-video bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                </TabsContent>

                {/* ABOUT TAB */}
                <TabsContent value="about" className="p-6 m-0">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-bold mb-4">À propos</h3>
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                    <h4 className="font-semibold mb-2">Réseaux sociaux</h4>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleSocialClick('instagram')}
                        className="text-pink-600 hover:underline"
                      >
                        Instagram
                      </button>
                      <button
                        onClick={() => handleSocialClick('twitter')}
                        className="text-blue-400 hover:underline"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => handleSocialClick('youtube')}
                        className="text-red-600 hover:underline"
                      >
                        YouTube
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* MESSAGERIE PANEL (OVERLAY avec backdrop) */}
      {showMessages && (
        <>
          {/* ✅ BACKDROP - Ferme au clic */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowMessages(false)}
            aria-label="Fermer la messagerie"
          />

          {/* ✅ PANEL - Ne se ferme PAS au clic */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <div
              className="w-full max-w-6xl h-[80vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MessagingPanel
                onClose={() => setShowMessages(false)}
                currentUser={currentUser}
                conversations={getConversationsForUser(currentUser.id)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
