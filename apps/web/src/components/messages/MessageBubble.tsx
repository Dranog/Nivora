'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '@/lib/api/messages';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onUnlock?: (messageId: string) => void;
  isUnlocking?: boolean;
}

export function MessageBubble({ message, isOwn, onUnlock, isUnlocking }: MessageBubbleProps) {
  const isPpvLocked = message.type === 'PPV_LOCKED';
  const isPpvUnlocked = message.type === 'PPV_UNLOCKED';
  const isMedia = ['IMAGE', 'VIDEO'].includes(message.type);

  // Format price
  const formattedPrice = message.priceCents
    ? `${(message.priceCents / 100).toFixed(2)}€`
    : '';

  return (
    <div className={cn('flex gap-3 mb-4', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender.avatarUrl} alt={message.sender.displayName || message.sender.handle} />
          <AvatarFallback>
            {(message.sender.displayName || message.sender.handle).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            isPpvLocked && 'bg-muted/50 border-2 border-dashed border-muted-foreground/30'
          )}
        >
          {/* PPV Locked state */}
          {isPpvLocked && (
            <Card className="p-4 bg-background/95">
              <div className="flex flex-col items-center gap-3 text-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm mb-1">Message verrouillé</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Débloquez ce contenu exclusif pour {formattedPrice}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onUnlock?.(message.id)}
                  disabled={isUnlocking}
                >
                  {isUnlocking ? 'Déblocage...' : `Débloquer pour ${formattedPrice}`}
                </Button>
              </div>
            </Card>
          )}

          {/* Regular text message */}
          {!isPpvLocked && message.type === 'TEXT' && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Image message */}
          {!isPpvLocked && message.type === 'IMAGE' && (
            <div className="space-y-2">
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}
              <img
                src={message.mediaUrl}
                alt="Image"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}

          {/* Video message */}
          {!isPpvLocked && message.type === 'VIDEO' && (
            <div className="space-y-2">
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}
              <video
                src={message.mediaUrl}
                controls
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}

          {/* PPV Unlocked indicator */}
          {isPpvUnlocked && (
            <div className="mb-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="w-3 h-3" />
              <span>Contenu débloqué</span>
            </div>
          )}
        </div>

        {/* Timestamp and read status */}
        <div className={cn('flex items-center gap-1 mt-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn && (
            <div>
              {message.isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
