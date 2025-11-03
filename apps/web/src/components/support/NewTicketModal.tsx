/**
 * NewTicketModal Component
 * Create new support ticket
 */

'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TicketPriority, TicketCategory } from '@/types/support';
import { TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/types/support';

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    subject: string;
    content: string;
    priority: TicketPriority;
    category: TicketCategory;
  }) => void;
  isSubmitting?: boolean;
}

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  priority: z.enum(['low', 'normal', 'high']),
  category: z.enum(['technical', 'billing', 'content', 'other']),
});

export function NewTicketModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: NewTicketModalProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [category, setCategory] = useState<TicketCategory>('technical');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = ticketSchema.safeParse({ subject, content, priority, category });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      if (result.error && result.error.issues) {
        result.error.issues.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit({ subject, content, priority, category });
  };

  const resetForm = () => {
    setSubject('');
    setContent('');
    setPriority('normal');
    setCategory('technical');
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="new-ticket-modal">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Submit a new support request. We'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              data-testid="ticket-subject-input"
            />
            {errors.subject && (
              <p className="text-sm text-destructive mt-1" role="alert">
                {errors.subject}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger data-testid="ticket-priority-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
              <SelectTrigger data-testid="ticket-category-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed information about your issue..."
              className="min-h-[150px]"
              data-testid="ticket-content-textarea"
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1" role="alert">
                {errors.content}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="submit-ticket-btn">
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
