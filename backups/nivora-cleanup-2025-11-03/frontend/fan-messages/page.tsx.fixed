'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InboxList } from '@/components/messages/InboxList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import type { Conversation } from '@/lib/api/messages';

export default function FanMessagesPage() {
  const router = useRouter();
  const { isAuthenticated, role, userId } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('auth-token'));
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !token || !userId) {
      router.push('/');
      return;
    }
    if (role !== 'fan' && role !== 'creator') {
      router.push('/');
      return;
    }
  }, [isHydrated, isAuthenticated, token, userId, role, router]);

  if (!isHydrated || !isAuthenticated || !token || !userId) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <div className="border-b p-4">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <InboxList jwt={token} currentUserId={userId} onSelectConversation={setSelectedConversation} selectedConversationId={selectedConversation?.id} />
          </div>
        </Card>
        <Card className="md:col-span-2 overflow-hidden flex-col flex">
          {selectedConversation ? (
            <ChatWindow jwt={token} currentUserId={userId} otherUser={selectedConversation.otherUser} conversationId={selectedConversation.id} onBack={() => setSelectedConversation(null)} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Sélectionnez une conversation pour commencer</div>
          )}
        </Card>
      </div>
    </div>
  );
}
