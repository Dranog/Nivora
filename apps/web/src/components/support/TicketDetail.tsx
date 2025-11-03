/**
 * TicketDetail Component
 * Display ticket details with reply form
 */

'use client';

import { useState } from 'react';
import { ArrowLeft, User, Send, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Ticket } from '@/types/support';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/types/support';

interface TicketDetailProps {
  ticket: Ticket;
  isLoading: boolean;
  onReply: (content: string) => void;
  onAssign: (assignToMe: boolean) => void;
  onClose: () => void;
  isReplying?: boolean;
  isAssigning?: boolean;
  isClosing?: boolean;
}

export function TicketDetail({
  ticket,
  isLoading,
  onReply,
  onAssign,
  onClose,
  isReplying = false,
  isAssigning = false,
  isClosing = false,
}: TicketDetailProps) {
  const router = useRouter();
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = TICKET_STATUSES.find((s) => s.value === status);
    return <Badge className={config?.color}>{config?.label || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = TICKET_PRIORITIES.find((p) => p.value === priority);
    return <Badge variant="outline" className={config?.color}>{config?.label || priority}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isClosed = ticket.status === 'closed';

  return (
    <div className="space-y-6" data-testid="ticket-detail">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/creator/support')}
            data-testid="back-btn"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              <span className="text-sm text-muted-foreground capitalize">
                {ticket.category}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {ticket.userName} ({ticket.userEmail})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!ticket.assignedTo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssign(true)}
              disabled={isAssigning || isClosed}
              data-testid="assign-btn"
            >
              {isAssigning ? 'Assigning...' : 'Assign to Me'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssign(false)}
              disabled={isAssigning || isClosed}
              data-testid="unassign-btn"
            >
              {isAssigning ? 'Unassigning...' : 'Unassign'}
            </Button>
          )}

          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isClosing}
              data-testid="close-ticket-btn"
            >
              <Check className="h-4 w-4 mr-1" />
              {isClosing ? 'Closing...' : 'Close Ticket'}
            </Button>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isStaff ? 'flex-row-reverse' : ''}`}
              data-testid={`message-${message.id}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={message.isStaff ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                  {message.isStaff ? 'S' : 'U'}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 ${message.isStaff ? 'text-right' : ''}`}>
                <div
                  className={`inline-block rounded-lg p-3 ${
                    message.isStaff
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${message.isStaff ? 'text-right' : ''}`}>
                  {message.author} • {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {!isClosed && (
        <Card data-testid="reply-form">
          <CardHeader>
            <CardTitle className="text-base">Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              className="min-h-[120px]"
              data-testid="reply-textarea"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || isReplying}
                data-testid="send-reply-btn"
              >
                {isReplying ? 'Sending...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
