/**
 * Support Tickets API Client (F8)
 */

import type {
  TicketsListResponse,
  TicketFilters,
  Ticket,
  CreateTicketRequest,
  ReplyTicketRequest,
  AssignTicketRequest,
  CloseTicketRequest,
} from '@/types/support';

const API_BASE = '/api/support';

/**
 * Get tickets list with filters
 */
export async function getTickets(filters: TicketFilters = {}): Promise<TicketsListResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.category) params.set('category', filters.category);
  if (filters.assigned !== undefined) params.set('assigned', filters.assigned.toString());
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE}/tickets?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tickets');
  }

  return response.json();
}

/**
 * Get ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch ticket');
  }

  return response.json();
}

/**
 * Create new ticket
 */
export async function createTicket(data: CreateTicketRequest): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to create ticket');
  }

  return response.json();
}

/**
 * Reply to ticket
 */
export async function replyTicket(data: ReplyTicketRequest): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${data.ticketId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: data.content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to reply to ticket');
  }

  return response.json();
}

/**
 * Assign/unassign ticket
 */
export async function assignTicket(data: AssignTicketRequest): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${data.ticketId}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignToMe: data.assignToMe }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to assign ticket');
  }

  return response.json();
}

/**
 * Close ticket
 */
export async function closeTicket(data: CloseTicketRequest): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${data.ticketId}/close`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to close ticket');
  }

  return response.json();
}
