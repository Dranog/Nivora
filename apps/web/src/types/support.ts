/**
 * Support Tickets Types
 */

export type TicketStatus = 'open' | 'pending' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high';
export type TicketCategory = 'technical' | 'billing' | 'content' | 'other';

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  createdAt: string; // ISO date
  isStaff: boolean; // true = staff reply, false = user message
  author: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  messages: TicketMessage[];
  assignedTo?: string; // "You" or null
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  userId: string;
  userName: string;
  userEmail: string;
}

export interface TicketsListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigned?: boolean; // true = assigned to me, false = unassigned, undefined = all
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketRequest {
  subject: string;
  content: string;
  priority: TicketPriority;
  category: TicketCategory;
}

export interface ReplyTicketRequest {
  ticketId: string;
  content: string;
}

export interface AssignTicketRequest {
  ticketId: string;
  assignToMe: boolean; // true = assign to me, false = unassign
}

export interface CloseTicketRequest {
  ticketId: string;
}

// Status definitions
export const TICKET_STATUSES: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Open', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

// Priority definitions
export const TICKET_PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'normal', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

// Category definitions
export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'billing', label: 'Billing' },
  { value: 'content', label: 'Content' },
  { value: 'other', label: 'Other' },
];
