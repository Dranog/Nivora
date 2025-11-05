'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Search,
  Phone,
  Video,
  X,
  Heart,
  Check,
  Smile,
  Send,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  Pin,
  Archive,
  Trash2,
  Lock,
  Flame,
  ThumbsUp,
  DollarSign,
  Star,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { demoConversations, demoMessages, type Conversation, type Message } from '@/lib/demo/messages';
import { cn } from '@/lib/utils';

export function MessagingPanel({
  onClose,
  currentUser,
  conversations: initialConversations
}: {
  onClose: () => void;
  currentUser: any;
  conversations?: Conversation[];
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations || demoConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversations?.[0]?.id || '1');
  const [messages, setMessages] = useState<Message[]>(demoMessages[initialConversations?.[0]?.id || '1'] || []);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationFilter, setConversationFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // ✅ Naviguer vers profil créateur
  const goToProfile = (username: string) => {
    router.push(`/profile/${username}`);
    onClose();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (messageInput.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [messageInput]);

  // ✅ BLOQUER LE SCROLL DE LA PAGE DERRIÈRE
  useEffect(() => {
    // Sauvegarder le scroll actuel
    const scrollY = window.scrollY;

    // Bloquer le scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Nettoyer au démontage
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ✅ Fermer emoji picker au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // ✅ Ajouter emoji au message
  const onEmojiSelect = (emoji: any) => {
    setMessageInput(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      conversationId: activeConversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: messageInput,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Update conversation lastMessage
    setConversations(conversations.map(c =>
      c.id === activeConversationId
        ? { ...c, lastMessage: messageInput, lastMessageTime: new Date() }
        : c
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const togglePin = (conversationId: string) => {
    setConversations(conversations.map(c =>
      c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
    ));
  };

  const archiveConversation = (conversationId: string) => {
    setConversations(conversations.map(c =>
      c.id === conversationId ? { ...c, isArchived: !c.isArchived } : c
    ));
  };

  const unlockPPV = (messageId: string) => {
    setMessages(messages.map(m =>
      m.id === messageId && m.isPPV ? { ...m, ppvUnlocked: true } : m
    ));
  };

  const addReaction = (messageId: string, reaction: 'heart' | 'fire' | 'thumbs_up') => {
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        const reactions = m.reactions || [];
        return { ...m, reactions: [...reactions, reaction] };
      }
      return m;
    }));
  };

  const filteredConversations = conversations
    .filter(c => {
      if (conversationFilter === 'unread') return c.unreadCount > 0;
      if (conversationFilter === 'archived') return c.isArchived;
      return !c.isArchived;
    })
    .filter(c =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    return `Il y a ${days}j`;
  };

  return (
    <div className="my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 relative">

      {/* ✅ BOUTON X EN HAUT À DROITE (TOUJOURS VISIBLE) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Fermer la messagerie"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="grid grid-cols-12 h-[700px]">

        {/* SIDEBAR - Liste conversations */}
        <div className="col-span-4 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
          {/* Header - FIXE */}
          <div className="p-6 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              <Button variant="ghost" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 border-0"
              />
            </div>

            {/* Tabs */}
            <Tabs value={conversationFilter} onValueChange={(v) => setConversationFilter(v as any)}>
              <TabsList className="w-full grid grid-cols-3 bg-gray-100">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="unread">
                  Non-lus
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <Badge className="ml-2 bg-cyan-500 text-white">
                      {conversations.filter(c => c.unreadCount > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived">Archivés</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Liste conversations - SCROLLABLE */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setMessages(demoMessages[conv.id] || []);
                }}
                className={cn(
                  'p-4 cursor-pointer transition-colors border-b border-gray-100 relative',
                  activeConversationId === conv.id
                    ? 'bg-cyan-50 border-l-4 border-l-cyan-500'
                    : 'hover:bg-white'
                )}
              >
                {conv.isPinned && (
                  <Pin className="absolute top-2 right-2 w-3 h-3 text-cyan-500" />
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar CLIQUABLE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToProfile(conv.participantUsername);
                    }}
                    className="relative flex-shrink-0"
                  >
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-cyan-500 transition-all"
                    />
                    {conv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    {conv.labels.includes('top_fan') && (
                      <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {/* Nom CLIQUABLE */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToProfile(conv.participantUsername);
                        }}
                        className="font-semibold text-gray-900 truncate hover:text-cyan-500 transition-colors text-left"
                      >
                        {conv.participantName}
                      </button>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      {conv.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          {label === 'vip' && '👑 VIP'}
                          {label === 'top_fan' && '⭐ Top'}
                          {label === 'new' && '🆕 Nouveau'}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>

                    {conv.unreadCount > 0 && (
                      <Badge className="mt-1 bg-cyan-500 text-white text-xs">
                        {conv.unreadCount} nouveau{conv.unreadCount > 1 ? 'x' : ''}
                      </Badge>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePin(conv.id)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {conv.isPinned ? 'Désépingler' : 'Épingler'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveConversation(conv.id)}>
                        <Archive className="w-4 h-4 mr-2" />
                        {conv.isArchived ? 'Désarchiver' : 'Archiver'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ZONE CHAT */}
        <div className="col-span-8 flex flex-col overflow-hidden">
          {activeConversation ? (
            <>
              {/* Header chat - FIXE */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                {/* Avatar + Nom CLIQUABLES */}
                <button
                  onClick={() => goToProfile(activeConversation.participantUsername)}
                  className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1 -ml-2 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <img
                      src={activeConversation.participantAvatar}
                      alt={activeConversation.participantName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {activeConversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {activeConversation.participantName}
                      {activeConversation.labels.includes('top_fan') && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      {activeConversation.isOnline ? (
                        <>● En ligne</>
                      ) : (
                        <span className="text-gray-500">
                          Vu {formatTime(activeConversation.lastSeen!)}
                        </span>
                      )}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {/* Boutons Phone/Video FONCTIONNELS */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toast.info('📞 Appel audio (à implémenter)')}
                  >
                    <Phone className="w-5 h-5 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toast.info('📹 Appel vidéo (à implémenter)')}
                  >
                    <Video className="w-5 h-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Messages - SCROLLABLE */}
              <div
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
                style={{
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-3',
                      msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* ✅ Avatar à gauche pour messages reçus */}
                    {msg.senderId !== currentUser.id && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      />
                    )}

                    <div className={cn(
                      'max-w-md',
                      msg.senderId === currentUser.id && 'order-first'
                    )}>
                      {msg.isPPV ? (
                        <div className="bg-white rounded-2xl border-2 border-cyan-500 overflow-hidden shadow-lg">
                          <div className="relative">
                            <img
                              src={msg.ppvUnlocked ? msg.mediaUrl : msg.mediaThumbnail}
                              alt="PPV Content"
                              className={cn(
                                'w-full aspect-video object-cover',
                                !msg.ppvUnlocked && 'blur-md'
                              )}
                            />
                            {!msg.ppvUnlocked && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <Lock className="w-12 h-12 text-white mb-4" />
                                <p className="text-white font-bold text-2xl mb-4">
                                  €{msg.ppvPrice?.toFixed(2)}
                                </p>
                                <Button
                                  onClick={() => unlockPPV(msg.id)}
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                                >
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Débloquer
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-gray-900 font-medium">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-3',
                            msg.senderId === currentUser.id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-tr-none'
                              : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}

                      <div className={cn(
                        'flex items-center gap-2 mt-1 text-xs text-gray-500',
                        msg.senderId === currentUser.id && 'justify-end'
                      )}>
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1">
                            {msg.reactions.map((reaction, idx) => (
                              <span key={idx}>
                                {reaction === 'heart' && '❤️'}
                                {reaction === 'fire' && '🔥'}
                                {reaction === 'thumbs_up' && '👍'}
                              </span>
                            ))}
                          </div>
                        )}
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.senderId === currentUser.id && msg.isRead && (
                          <>
                            <Check className="w-3 h-3" />
                            <Check className="w-3 h-3 -ml-2" />
                          </>
                        )}
                      </div>

                      {msg.senderId !== currentUser.id && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => addReaction(msg.id, 'heart')}
                          >
                            <Heart className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => addReaction(msg.id, 'fire')}
                          >
                            <Flame className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => addReaction(msg.id, 'thumbs_up')}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* ✅ Avatar à droite pour messages envoyés par le fan */}
                    {msg.senderId === currentUser.id && (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      />
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConversation.participantAvatar}
                      alt="typing"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input - FIXE */}
              <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-end gap-3">

                  {/* ✅ BOUTON TROMBONE - Upload fichiers */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file);
                        toast.success(`📎 Fichier "${file.name}" prêt à envoyer`);
                      }
                    }}
                  />

                  {/* ✅ BOUTON EMOJI - Fonctionnel */}
                  <div className="relative" ref={emojiPickerRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-5 h-5 text-gray-600" />
                    </Button>

                    {/* Emoji Picker Popup */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-lg overflow-hidden">
                        <Picker
                          data={data}
                          onEmojiSelect={onEmojiSelect}
                          theme="light"
                          locale="fr"
                          previewPosition="none"
                          skinTonePosition="none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 relative">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Votre message..."
                      className="pr-12 bg-gray-100 border-0 rounded-full"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full p-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
