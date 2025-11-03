/**
 * MSW Handlers for Admin API (F12)
 */

import { http, HttpResponse } from 'msw';
import type {
  AdminUser,
  AdminPost,
  AdminReport,
  AdminUsersResponse,
  AdminPostsResponse,
  AdminReportsResponse,
} from '@/types/admin';

// Mock Data
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    displayName: 'John Doe',
    role: 'fan',
    status: 'active',
    onboardingDone: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    postsCount: 5,
    reportsCount: 0,
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    role: 'creator',
    status: 'active',
    onboardingDone: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    postsCount: 10,
    reportsCount: 1,
  },
  {
    id: 'user-3',
    email: 'banned@example.com',
    displayName: 'Banned User',
    role: 'fan',
    status: 'banned',
    onboardingDone: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    bannedAt: '2024-01-10T00:00:00Z',
    bannedReason: 'Violation of terms',
    postsCount: 0,
    reportsCount: 3,
  },
];

export const mockAdminPosts: AdminPost[] = [
  {
    id: 'post-1',
    title: 'First Post',
    content: 'Content of first post',
    authorId: 'user-2',
    authorName: 'Jane Smith',
    authorEmail: 'jane@example.com',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-01T00:00:00Z',
    publishedAt: '2024-01-01T00:00:00Z',
    viewsCount: 100,
    likesCount: 10,
    reportsCount: 0,
  },
  {
    id: 'post-2',
    title: 'Second Post',
    content: 'Content of second post',
    authorId: 'user-2',
    authorName: 'Jane Smith',
    authorEmail: 'jane@example.com',
    status: 'published',
    visibility: 'public',
    createdAt: '2024-01-02T00:00:00Z',
    publishedAt: '2024-01-02T00:00:00Z',
    viewsCount: 50,
    likesCount: 5,
    reportsCount: 2,
  },
  {
    id: 'post-3',
    title: 'Taken Down Post',
    content: 'Inappropriate content',
    authorId: 'user-1',
    authorName: 'John Doe',
    authorEmail: 'john@example.com',
    status: 'taken_down',
    visibility: 'public',
    createdAt: '2024-01-03T00:00:00Z',
    publishedAt: '2024-01-03T00:00:00Z',
    takenDownAt: '2024-01-05T00:00:00Z',
    takenDownReason: 'Violates community guidelines',
    viewsCount: 200,
    likesCount: 1,
    reportsCount: 5,
  },
];

export const mockAdminReports: AdminReport[] = [
  {
    id: 'report-1',
    type: 'post',
    reason: 'spam',
    description: 'This post is spam',
    status: 'open',
    reporterId: 'user-1',
    reporterEmail: 'john@example.com',
    reportedPostId: 'post-2',
    reportedPostTitle: 'Second Post',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'report-2',
    type: 'user',
    reason: 'harassment',
    description: 'User is harassing others',
    status: 'open',
    reporterId: 'user-2',
    reporterEmail: 'jane@example.com',
    reportedUserId: 'user-3',
    reportedUserEmail: 'banned@example.com',
    assignedTo: 'admin-1',
    assignedToName: 'Admin User',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'report-3',
    type: 'post',
    reason: 'hate_speech',
    description: 'Contains hate speech',
    status: 'resolved',
    reporterId: 'user-1',
    reporterEmail: 'john@example.com',
    reportedPostId: 'post-3',
    reportedPostTitle: 'Taken Down Post',
    createdAt: '2024-01-03T00:00:00Z',
    resolvedAt: '2024-01-04T00:00:00Z',
    resolvedBy: 'admin-1',
    resolutionNote: 'Post taken down',
  },
];

// In-memory state for testing mutations
let users = [...mockAdminUsers];
let posts = [...mockAdminPosts];
let reports = [...mockAdminReports];

export const resetMockData = () => {
  users = [...mockAdminUsers];
  posts = [...mockAdminPosts];
  reports = [...mockAdminReports];
};

const API_BASE = 'http://localhost:3001/api';

export const adminHandlers = [
  // ============================================================================
  // Users
  // ============================================================================

  // Fetch users
  http.get(`${API_BASE}/admin/v2/users`, () => {
    const response: AdminUsersResponse = {
      users,
      total: users.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    return HttpResponse.json(response);
  }),

  // Ban user
  http.post(`${API_BASE}/admin/v2/users/:userId/ban`, async ({ params, request }) => {
    const { userId } = params;
    const body = await request.json() as { reason: string };

    // Simulate error for specific test case
    if (body.reason === 'TRIGGER_ERROR') {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    users[userIndex] = {
      ...users[userIndex],
      status: 'banned',
      bannedAt: new Date().toISOString(),
      bannedReason: body.reason,
    };

    return HttpResponse.json({ success: true });
  }),

  // Unban user
  http.post(`${API_BASE}/admin/v2/users/:userId/unban`, ({ params }) => {
    const { userId } = params;

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    users[userIndex] = {
      ...users[userIndex],
      status: 'active',
      bannedAt: undefined,
      bannedReason: undefined,
    };

    return HttpResponse.json({ success: true });
  }),

  // Bulk ban users
  http.post(`${API_BASE}/admin/v2/users/bulk/ban`, async ({ request }) => {
    const body = await request.json() as { userIds: string[]; reason: string };

    body.userIds.forEach((userId) => {
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'banned',
          bannedAt: new Date().toISOString(),
          bannedReason: body.reason,
        };
      }
    });

    return HttpResponse.json({ success: true });
  }),

  // Bulk unban users
  http.post(`${API_BASE}/admin/v2/users/bulk/unban`, async ({ request }) => {
    const body = await request.json() as { userIds: string[] };

    body.userIds.forEach((userId) => {
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status: 'active',
          bannedAt: undefined,
          bannedReason: undefined,
        };
      }
    });

    return HttpResponse.json({ success: true });
  }),

  // ============================================================================
  // Posts
  // ============================================================================

  // Fetch posts
  http.get(`${API_BASE}/admin/v2/posts`, () => {
    const response: AdminPostsResponse = {
      posts,
      total: posts.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    return HttpResponse.json(response);
  }),

  // Takedown post
  http.post(`${API_BASE}/admin/v2/posts/:postId/takedown`, async ({ params, request }) => {
    const { postId } = params;
    const body = await request.json() as { reason: string };

    // Simulate error for specific test case
    if (body.reason === 'TRIGGER_ERROR') {
      return HttpResponse.json(
        { error: 'Bad request' },
        { status: 400 }
      );
    }

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      status: 'taken_down',
      takenDownAt: new Date().toISOString(),
      takenDownReason: body.reason,
    };

    return HttpResponse.json({ success: true });
  }),

  // Restore post
  http.post(`${API_BASE}/admin/v2/posts/:postId/restore`, ({ params }) => {
    const { postId } = params;

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      status: 'published',
      takenDownAt: undefined,
      takenDownReason: undefined,
    };

    return HttpResponse.json({ success: true });
  }),

  // Bulk takedown posts
  http.post(`${API_BASE}/admin/v2/posts/bulk/takedown`, async ({ request }) => {
    const body = await request.json() as { postIds: string[]; reason: string };

    body.postIds.forEach((postId) => {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex !== -1) {
        posts[postIndex] = {
          ...posts[postIndex],
          status: 'taken_down',
          takenDownAt: new Date().toISOString(),
          takenDownReason: body.reason,
        };
      }
    });

    return HttpResponse.json({ success: true });
  }),

  // Bulk restore posts
  http.post(`${API_BASE}/admin/v2/posts/bulk/restore`, async ({ request }) => {
    const body = await request.json() as { postIds: string[] };

    body.postIds.forEach((postId) => {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex !== -1) {
        posts[postIndex] = {
          ...posts[postIndex],
          status: 'published',
          takenDownAt: undefined,
          takenDownReason: undefined,
        };
      }
    });

    return HttpResponse.json({ success: true });
  }),

  // ============================================================================
  // Reports
  // ============================================================================

  // Fetch reports
  http.get(`${API_BASE}/admin/reports`, () => {
    const openCount = reports.filter((r) => r.status === 'open').length;
    const response: AdminReportsResponse = {
      reports,
      total: reports.length,
      page: 1,
      limit: 20,
      totalPages: 1,
      openCount,
    };
    return HttpResponse.json(response);
  }),

  // Resolve report
  http.post(`${API_BASE}/admin/reports/:reportId/resolve`, async ({ params, request }) => {
    const { reportId } = params;
    const body = await request.json() as { note?: string };

    const reportIndex = reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    reports[reportIndex] = {
      ...reports[reportIndex],
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'admin-1',
      resolutionNote: body.note,
    };

    return HttpResponse.json({ success: true });
  }),

  // Assign report
  http.post(`${API_BASE}/admin/reports/:reportId/assign`, async ({ params, request }) => {
    const { reportId } = params;
    const body = await request.json() as { assignToMe: boolean };

    const reportIndex = reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (body.assignToMe) {
      reports[reportIndex] = {
        ...reports[reportIndex],
        assignedTo: 'current-admin-id',
        assignedToName: 'Current Admin',
      };
    } else {
      reports[reportIndex] = {
        ...reports[reportIndex],
        assignedTo: undefined,
        assignedToName: undefined,
      };
    }

    return HttpResponse.json({ success: true });
  }),

  // Bulk resolve reports
  http.post(`${API_BASE}/admin/reports/bulk/resolve`, async ({ request }) => {
    const body = await request.json() as { reportIds: string[] };

    body.reportIds.forEach((reportId) => {
      const reportIndex = reports.findIndex((r) => r.id === reportId);
      if (reportIndex !== -1) {
        reports[reportIndex] = {
          ...reports[reportIndex],
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolvedBy: 'admin-1',
        };
      }
    });

    return HttpResponse.json({ success: true });
  }),
];
