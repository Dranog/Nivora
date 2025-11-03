/**
 * Support Tickets Hooks (F8)
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api/tickets';
import type {
  TicketFilters,
  CreateTicketRequest,
  ReplyTicketRequest,
  AssignTicketRequest,
  CloseTicketRequest,
} from '@/types/support';

/**
 * Get tickets list
 */
export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['support', 'tickets', filters],
    queryFn: () => api.getTickets(filters),
    staleTime: 30000, // 30s
  });
}

/**
 * Get ticket by ID
 */
export function useTicket(id: string) {
  return useQuery({
    queryKey: ['support', 'tickets', id],
    queryFn: () => api.getTicketById(id),
    enabled: !!id,
    staleTime: 15000, // 15s (shorter for real-time feel)
  });
}

/**
 * Create ticket mutation
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'], exact: false });

      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been created.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reply to ticket mutation
 */
export function useReplyTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.replyTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'], exact: false });

      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Reply',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Assign ticket mutation
 */
export function useAssignTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.assignTicket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'], exact: false });

      toast({
        title: variables.assignToMe ? 'Ticket Assigned' : 'Ticket Unassigned',
        description: variables.assignToMe ? 'Ticket has been assigned to you.' : 'Ticket has been unassigned.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Close ticket mutation
 */
export function useCloseTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.closeTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'], exact: false });

      toast({
        title: 'Ticket Closed',
        description: 'Ticket has been marked as closed.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Close Ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
