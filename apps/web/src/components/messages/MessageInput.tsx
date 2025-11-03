'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, Image, Video, Lock, DollarSign } from 'lucide-react';
import { emitTyping } from '@/lib/realtime/messages-socket';
import type { SendMessageDto } from '@/lib/api/messages';

interface MessageInputProps {
  conversationId?: string;
  onSend: (data: SendMessageDto) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ conversationId, onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPpvDialogOpen, setIsPpvDialogOpen] = useState(false);
  const [ppvPrice, setPpvPrice] = useState('');
  const [ppvContent, setPpvContent] = useState('');
  const [ppvMediaUrl, setPpvMediaUrl] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = (value: string) => {
    setContent(value);

    // Emit typing indicator
    if (conversationId) {
      emitTyping(conversationId, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(conversationId, false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSend({
        type: 'TEXT',
        content: content.trim(),
      });
      setContent('');

      // Stop typing indicator
      if (conversationId) {
        emitTyping(conversationId, false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPpv = async () => {
    if (!ppvContent.trim() && !ppvMediaUrl) return;

    const priceCents = Math.round(parseFloat(ppvPrice) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      alert('Veuillez entrer un prix valide');
      return;
    }

    try {
      setIsSending(true);
      await onSend({
        type: 'PPV_LOCKED',
        content: ppvContent.trim() || undefined,
        mediaUrl: ppvMediaUrl || undefined,
        priceCents,
      });

      // Reset PPV form
      setPpvContent('');
      setPpvMediaUrl('');
      setPpvPrice('');
      setIsPpvDialogOpen(false);
    } catch (error) {
      console.error('Failed to send PPV message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMediaUpload = async (type: 'image' | 'video') => {
    // TODO: Implement file upload
    // For now, just show an alert
    alert(`Upload ${type} - À implémenter avec StorageService`);
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2">
        {/* Text input */}
        <div className="flex-1">
          <Textarea
            placeholder="Écrivez votre message..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {/* Send button */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!content.trim() || disabled || isSending}
          >
            <Send className="w-4 h-4" />
          </Button>

          {/* Media upload buttons */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleMediaUpload('image')}
            disabled={disabled || isSending}
            title="Envoyer une image"
          >
            <Image className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => handleMediaUpload('video')}
            disabled={disabled || isSending}
            title="Envoyer une vidéo"
          >
            <Video className="w-4 h-4" />
          </Button>

          {/* PPV message dialog */}
          <Dialog open={isPpvDialogOpen} onOpenChange={setIsPpvDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                disabled={disabled || isSending}
                title="Envoyer un message PPV"
              >
                <Lock className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Message PPV (Pay-Per-View)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="ppv-price">Prix (€)</Label>
                  <Input
                    id="ppv-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="5.00"
                    value={ppvPrice}
                    onChange={(e) => setPpvPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ppv-content">Message (optionnel)</Label>
                  <Textarea
                    id="ppv-content"
                    placeholder="Décrivez le contenu..."
                    value={ppvContent}
                    onChange={(e) => setPpvContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="ppv-media">URL média (optionnel)</Label>
                  <Input
                    id="ppv-media"
                    placeholder="https://..."
                    value={ppvMediaUrl}
                    onChange={(e) => setPpvMediaUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL de l'image ou vidéo verrouillée
                  </p>
                </div>
                <Button
                  onClick={handleSendPpv}
                  disabled={isSending || (!ppvContent.trim() && !ppvMediaUrl) || !ppvPrice}
                  className="w-full"
                >
                  {isSending ? 'Envoi...' : 'Envoyer le message PPV'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* TODO: Tip button */}
          {/* <Button
            size="icon"
            variant="outline"
            disabled={disabled || isSending}
            title="Envoyer un pourboire"
          >
            <DollarSign className="w-4 h-4" />
          </Button> */}
        </div>
      </div>
    </div>
  );
}
