/**
 * MSW Handlers for Support Tickets API (F8)
 */

import { http, HttpResponse } from 'msw';
import type {
  Ticket,
  TicketMessage,
  TicketsListResponse,
  CreateTicketRequest,
} from '@/types/support';

const API_BASE = '/api/support';

// Mock Tickets
let mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    subject: 'Payment issue with subscription',
    status: 'open',
    priority: 'high',
    category: 'billing',
    messages: [
      {
        id: 'msg-1',
        ticketId: 'ticket-1',
        content: 'I was charged twice for my subscription this month.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isStaff: false,
        author: 'John Doe',
      },
    ],
    assignedTo: undefined,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
  },
  {
    id: 'ticket-2',
    subject: 'Cannot access content',
    status: 'pending',
    priority: 'normal',
    category: 'technical',
    messages: [
      {
        id: 'msg-2',
        ticketId: 'ticket-2',
        content: 'I purchased content but cannot view it.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isStaff: false,
        author: 'Jane Smith',
      },
      {
        id: 'msg-3',
        ticketId: 'ticket-2',
        content: 'We are looking into this issue. Please check back soon.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isStaff: true,
        author: 'Support Team',
      },
    ],
    assignedTo: 'You',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
  },
  {
    id: 'ticket-3',
    subject: 'Request for refund',
    status: 'closed',
    priority: 'low',
    category: 'billing',
    messages: [
      {
        id: 'msg-4',
        ticketId: 'ticket-3',
        content: 'I would like to request a refund for my recent purchase.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isStaff: false,
        author: 'Mike Wilson',
      },
      {
        id: 'msg-5',
        ticketId: 'ticket-3',
        content: 'Your refund has been processed.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        isStaff: true,
        author: 'Support Team',
      },
    ],
    assignedTo: 'You',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user-3',
    userName: 'Mike Wilson',
    userEmail: 'mike@example.com',
  },
];

export const ticketsHandlers = [
  // GET /api/support/tickets - List tickets
  http.get(`${API_BASE}/tickets`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const assigned = url.searchParams.get('assigned');

    let filtered = [...mockTickets];

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (priority) {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    if (assigned === 'true') {
      filtered = filtered.filter((t) => t.assignedTo !== undefined);
    } else if (assigned === 'false') {
      filtered = filtered.filter((t) => t.assignedTo === undefined);
    }

    // Sort by updated desc
    filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const start = (page - 1) * limit;
    const end = start + limit;
    const tickets = filtered.slice(start, end);

    const response: TicketsListResponse = {
      tickets,
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/support/tickets/:id - Get ticket by ID
  http.get(`${API_BASE}/tickets/:id`, ({ params }) => {
    const ticket = mockTickets.find((t) => t.id === params.id);

    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return HttpResponse.json(ticket);
  }),

  // POST /api/support/tickets - Create ticket
  http.post(`${API_BASE}/tickets`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const body = (await request.json()) as CreateTicketRequest;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: '',
      content: body.content,
      createdAt: new Date().toISOString(),
      isStaff: false,
      author: 'Current User',
    };

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      subject: body.subject,
      status: 'open',
      priority: body.priority,
      category: body.category,
      messages: [newMessage],
      assignedTo: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'current-user',
      userName: 'Current User',
      userEmail: 'current@example.com',
    };

    newMessage.ticketId = newTicket.id;
    mockTickets.unshift(newTicket);

    return HttpResponse.json(newTicket);
  }),

  // POST /api/support/tickets/:id/reply - Reply to ticket
  http.post(`${API_BASE}/tickets/:ticketId/reply`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const body = (await request.json()) as { content: string };
    const ticket = mockTickets.find((t) => t.id === params.ticketId);

    if (!ticket) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      content: body.content,
      createdAt: new Date().toISOString(),
      isStaff: true,
      author: 'You',
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date().toISOString();
    ticket.status = 'pending';

    return HttpResponse.json(ticket);
  }),

  // PATCH /api/support/tickets/:id/assign - Assign/unassign ticket
  http.patch(`${API_BASE}/tickets/:ticketId/assign`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const body = (await request.json()) as { assignToMe: boolean };
    const ticket = mockTickets.find((t) => t.id === params.ticketId);

    if (!ticket) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    ticket.assignedTo = body.assignToMe ? 'You' : undefined;
    ticket.updatedAt = new Date().toISOString();

    return HttpResponse.json(ticket);
  }),

  // PATCH /api/support/tickets/:id/close - Close ticket
  http.patch(`${API_BASE}/tickets/:ticketId/close`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const ticket = mockTickets.find((t) => t.id === params.ticketId);

    if (!ticket) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    ticket.status = 'closed';
    ticket.updatedAt = new Date().toISOString();

    return HttpResponse.json(ticket);
  }),
];

// Helper to reset mock data
export function resetMockTickets() {
  mockTickets = [
    {
      id: 'ticket-1',
      subject: 'Payment issue with subscription',
      status: 'open',
      priority: 'high',
      category: 'billing',
      messages: [
        {
          id: 'msg-1',
          ticketId: 'ticket-1',
          content: 'I was charged twice for my subscription this month.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isStaff: false,
          author: 'John Doe',
        },
      ],
      assignedTo: undefined,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
    },
  ];
}
