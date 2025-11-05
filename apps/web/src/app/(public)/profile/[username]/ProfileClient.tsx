'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Search, Phone, Video, X, Heart, Check, Smile, Send } from 'lucide-react';

// Context pour gérer l'état de la fenêtre de messages
const MessageContext = createContext<{
  showMessages: boolean;
  setShowMessages: (show: boolean) => void;
} | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [showMessages, setShowMessages] = useState(false);

  return (
    <MessageContext.Provider value={{ showMessages, setShowMessages }}>
      {children}
    </MessageContext.Provider>
  );
}

function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within MessageProvider');
  }
  return context;
}

export function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="mb-4"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

export function MessageButton({ label }: { label: string }) {
  const { showMessages, setShowMessages } = useMessages();

  return (
    <Button
      variant="outline"
      className="flex-1"
      onClick={() => setShowMessages(!showMessages)}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

export function MessageWindow() {
  const { showMessages, setShowMessages } = useMessages();

  if (!showMessages) return null;

  return (
    <div className="my-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="grid grid-cols-12 h-[600px]">
        {/* SIDEBAR GAUCHE - Liste conversations */}
        <div className="col-span-4 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Messages</h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-4 text-sm">
              <button className="text-cyan-500 font-semibold border-b-2 border-cyan-500 pb-2">
                Tous
              </button>
              <button className="text-gray-600 hover:text-gray-900 pb-2">
                Non-lus
              </button>
              <button className="text-gray-600 hover:text-gray-900 pb-2">
                Archivés
              </button>
            </div>
          </div>

          {/* Liste conversations */}
          <div className="flex-1 overflow-y-auto">
            {/* Conversation active */}
            <div className="p-4 bg-cyan-50 border-l-4 border-cyan-500 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/150?img=47"
                    className="w-12 h-12 rounded-full"
                    alt="Jessica"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Jessica Lange</span>
                    <span className="text-xs text-gray-500">Il y a 5 min</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    Merci pour ton abo...
                  </p>
                </div>
              </div>
            </div>

            {/* Autres conversations */}
            <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <div className="flex items-start gap-3">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  className="w-12 h-12 rounded-full"
                  alt="Mark"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Mark Meyer</span>
                    <span className="text-xs text-gray-500">11h</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    Nouveau contenu disponible
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <div className="flex items-start gap-3">
                <img
                  src="https://i.pravatar.cc/150?img=33"
                  className="w-12 h-12 rounded-full"
                  alt="Adam"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Adam Perry</span>
                    <span className="text-xs text-gray-500">Hier</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    Tu as aimé mon dernier post ?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE CHAT PRINCIPALE */}
        <div className="col-span-8 flex flex-col">
          {/* Header chat */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?img=47"
                  className="w-10 h-10 rounded-full"
                  alt="Jessica"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Jessica Lange</h3>
                <p className="text-sm text-green-500">● En ligne</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setShowMessages(false)}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs conversation */}
          <div className="px-6 py-3 border-b border-gray-200 flex gap-6 text-sm">
            <button className="text-cyan-500 font-semibold border-b-2 border-cyan-500 pb-2">
              Tous
            </button>
            <button className="text-gray-600 hover:text-gray-900 pb-2">
              Non-lus
            </button>
            <button className="text-gray-600 hover:text-gray-900 pb-2">
              Archivés
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Message reçu */}
            <div className="flex items-start gap-3">
              <img
                src="https://i.pravatar.cc/150?img=47"
                className="w-10 h-10 rounded-full flex-shrink-0"
                alt="Jessica"
              />
              <div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                  <p className="text-gray-900">Salut !! Merci pour ton soutien 😊</p>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span>10:23</span>
                </div>
              </div>
            </div>

            {/* Message envoyé */}
            <div className="flex items-end gap-3 justify-end">
              <div>
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
                  <p>Avec plaisir, j&apos;adore ton contenu !</p>
                </div>
                <div className="flex items-center gap-2 mt-1 justify-end text-xs text-gray-500">
                  <span>10:24</span>
                  <Check className="w-3 h-3" />
                  <Check className="w-3 h-3 -ml-2" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img
                src="https://i.pravatar.cc/150?img=47"
                className="w-10 h-10 rounded-full flex-shrink-0"
                alt="Jessica"
              />
              <div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                  <p className="text-gray-900">Ça me touche vraiment 💖</p>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span>10:25</span>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3 justify-end">
              <div>
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
                  <p>Tu vas publier bientôt ?</p>
                </div>
                <div className="flex items-center gap-2 mt-1 justify-end text-xs text-gray-500">
                  <span>10:26</span>
                  <Check className="w-3 h-3" />
                  <Check className="w-3 h-3 -ml-2" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img
                src="https://i.pravatar.cc/150?img=47"
                className="w-10 h-10 rounded-full flex-shrink-0"
                alt="Jessica"
              />
              <div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                  <p className="text-gray-900">Oui ! Nouveau post ce soir à 20h🔥</p>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span>10:27</span>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3 justify-end">
              <div>
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
                  <p>Super ! Hâte de voir ça 🔥 👍</p>
                </div>
                <div className="flex items-center gap-2 mt-1 justify-end text-xs text-gray-500">
                  <span>10:28</span>
                  <Check className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Input message */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Smile className="w-6 h-6 text-gray-600" />
              </button>

              <input
                type="text"
                placeholder="Votre message..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <button className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}