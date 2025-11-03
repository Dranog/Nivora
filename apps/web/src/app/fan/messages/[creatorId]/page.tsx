'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { messagesApi, type Conversation } from '@/lib/api/messages';

interface PageProps {
  params: Promise<{
    creatorId: string;
  }>;
}

export default function ChatPage({ params }: PageProps) {
  const router = useRouter();
  const { isAuthenticated, role, userId } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  // Wait for Zustand store hydration and resolve params
  useEffect(() => {
    setIsHydrated(true);
    // Get JWT token from localStorage
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('auth-token'));
    }
    // Resolve params Promise
    params.then((p) => setCreatorId(p.creatorId));
  }, [params]);

  // Client-side redirect after hydration
  useEffect(() => {
    if (!isHydrated) return;

    // Redirect if not authenticated
    if (!isAuthenticated || !token || !userId) {
      router.push('/');
      return;
    }
  }, [isHydrated, isAuthenticated, token, userId, router]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !token || !userId || !creatorId) return;

    const loadConversation = async () => {
      try {
        setIsLoading(true);
        // Get all conversations and find the one with this creator
        const conversations = await messagesApi.getConversations();
        const found = conversations.find(
          (c) => c.otherUser.id === creatorId
        );

        if (found) {
          setConversation(found);
        } else {
          // Create a minimal conversation object for a new chat
          // The actual conversation will be created when the first message is sent
          setConversation({
            id: '', // Will be created on first message
            otherUser: {
              id: creatorId,
              handle: '', // Will be fetched
              displayName: '',
              avatarUrl: '',
              isOnline: false,
            },
            unreadCount: 0,
          });
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [creatorId, isHydrated, isAuthenticated, token, userId]);

  // Show loading during hydration
  if (!isHydrated || !isAuthenticated || !token || !userId) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <Card className="h-full flex items-center justify-center">
          <p>Chargement...</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <Card className="h-full flex items-center justify-center">
          <p>Chargement...</p>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <Card className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Conversation introuvable</p>
          <Button onClick={() => router.push('/fan/messages')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux messages
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <Card className="h-full overflow-hidden flex flex-col">
        <ChatWindow
          jwt={token}
          currentUserId={userId}
          otherUser={conversation.otherUser}
          conversationId={conversation.id || undefined}
          onBack={() => router.push('/fan/messages')}
        />
      </Card>
    </div>
  );
}
