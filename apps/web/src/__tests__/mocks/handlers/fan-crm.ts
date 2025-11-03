/**
 * MSW Handlers for Fan CRM API (F8)
 */

import { http, HttpResponse } from 'msw';
import type {
  Fan,
  FanTag,
  Note,
  Purchase,
  FanFilters,
  FansListResponse,
} from '@/types/crm';

const API_BASE = '/api/crm';

// Mock Tags
let mockTags: FanTag[] = [
  { id: 'tag-1', name: 'VIP', color: '#8b5cf6' },
  { id: 'tag-2', name: 'Active', color: '#10b981' },
  { id: 'tag-3', name: 'New', color: '#3b82f6' },
  { id: 'tag-4', name: 'At Risk', color: '#ef4444' },
];

// Mock Fans
let mockFans: Fan[] = [
  {
    id: 'fan-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: undefined,
    stage: 'vip',
    tags: [mockTags[0], mockTags[1]],
    totalSpent: 250.0,
    lastPurchase: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    purchases: [
      {
        id: 'purchase-1',
        type: 'subscription',
        amount: 50.0,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Monthly Subscription',
      },
    ],
  },
  {
    id: 'fan-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: undefined,
    stage: 'customer',
    tags: [mockTags[1]],
    totalSpent: 120.0,
    lastPurchase: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    purchases: [
      {
        id: 'purchase-2',
        type: 'ppv',
        amount: 20.0,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'PPV Content',
      },
    ],
  },
  {
    id: 'fan-3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    avatar: undefined,
    stage: 'lead',
    tags: [mockTags[2]],
    totalSpent: 0.0,
    lastPurchase: undefined,
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    purchases: [],
  },
];

export const fanCrmHandlers = [
  // GET /api/crm/fans/export - Export CSV (MUST be before /fans/:id)
  http.get(`${API_BASE}/fans/export`, () => {
    const csv = `Name,Email,Stage,Total Spent\n${mockFans
      .map((f) => `${f.name},${f.email},${f.stage},${f.totalSpent}`)
      .join('\n')}`;

    return HttpResponse.text(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="fans.csv"',
      },
    });
  }),

  // GET /api/crm/fans - List fans
  http.get(`${API_BASE}/fans`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const stage = url.searchParams.get('stage');
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean);
    const search = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...mockFans];

    if (stage) {
      filtered = filtered.filter((f) => f.stage === stage);
    }

    if (tags && tags.length > 0) {
      filtered = filtered.filter((f) =>
        tags.some((tagId) => f.tags.some((t) => t.id === tagId))
      );
    }

    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.email.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const fans = filtered.slice(start, end);

    const response: FansListResponse = {
      fans,
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/crm/fans/:id - Get fan by ID
  http.get(`${API_BASE}/fans/:id`, ({ params }) => {
    const fan = mockFans.find((f) => f.id === params.id);

    if (!fan) {
      return HttpResponse.json({ message: 'Fan not found' }, { status: 404 });
    }

    return HttpResponse.json(fan);
  }),

  // POST /api/crm/fans/:id/notes - Add note
  http.post(`${API_BASE}/fans/:fanId/notes`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const body = (await request.json()) as { content: string };
    const fan = mockFans.find((f) => f.id === params.fanId);

    if (!fan) {
      return HttpResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    const note: Note = {
      id: `note-${Date.now()}`,
      fanId: fan.id,
      content: body.content,
      createdAt: new Date().toISOString(),
      createdBy: 'You',
    };

    fan.notes.push(note);

    return HttpResponse.json(note);
  }),

  // POST /api/crm/fans/:id/tags - Add tag
  http.post(`${API_BASE}/fans/:fanId/tags`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const body = (await request.json()) as { tagId: string };
    const fan = mockFans.find((f) => f.id === params.fanId);
    const tag = mockTags.find((t) => t.id === body.tagId);

    if (!fan) {
      return HttpResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    if (!tag) {
      return HttpResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    if (!fan.tags.some((t) => t.id === tag.id)) {
      fan.tags.push(tag);
    }

    return HttpResponse.json(fan);
  }),

  // DELETE /api/crm/fans/:fanId/tags/:tagId - Remove tag
  http.delete(`${API_BASE}/fans/:fanId/tags/:tagId`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const fan = mockFans.find((f) => f.id === params.fanId);

    if (!fan) {
      return HttpResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    fan.tags = fan.tags.filter((t) => t.id !== params.tagId);

    return HttpResponse.json(fan);
  }),

  // PATCH /api/crm/fans/:id/stage - Change stage
  http.patch(`${API_BASE}/fans/:fanId/stage`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const body = (await request.json()) as { stage: string };
    const fan = mockFans.find((f) => f.id === params.fanId);

    if (!fan) {
      return HttpResponse.json({ error: 'Fan not found' }, { status: 404 });
    }

    fan.stage = body.stage as any;

    return HttpResponse.json(fan);
  }),

  // GET /api/crm/tags - Get tags
  http.get(`${API_BASE}/tags`, () => {
    return HttpResponse.json(mockTags);
  }),

  // POST /api/crm/tags - Create tag
  http.post(`${API_BASE}/tags`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const body = (await request.json()) as { name: string; color: string };

    const newTag: FanTag = {
      id: `tag-${Date.now()}`,
      name: body.name,
      color: body.color,
    };

    mockTags.push(newTag);

    return HttpResponse.json(newTag);
  }),
];

// Helper to reset mock data
export function resetMockFans() {
  mockFans = [
    {
      id: 'fan-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: undefined,
      stage: 'vip',
      tags: [mockTags[0], mockTags[1]],
      totalSpent: 250.0,
      lastPurchase: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      notes: [],
      purchases: [
        {
          id: 'purchase-1',
          type: 'subscription',
          amount: 50.0,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Monthly Subscription',
        },
      ],
    },
    {
      id: 'fan-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: undefined,
      stage: 'customer',
      tags: [mockTags[1]],
      totalSpent: 120.0,
      lastPurchase: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      notes: [],
      purchases: [
        {
          id: 'purchase-2',
          type: 'ppv',
          amount: 20.0,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'PPV Content',
        },
      ],
    },
    {
      id: 'fan-3',
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      avatar: undefined,
      stage: 'lead',
      tags: [mockTags[2]],
      totalSpent: 0.0,
      lastPurchase: undefined,
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: [],
      purchases: [],
    },
  ];
}
