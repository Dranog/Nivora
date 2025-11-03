/**
 * CRM API - F3 Fan Management + Query Keys
 */

import { http } from '@/lib/http';
import {
  type Fan,
  type FanList,
  type FanStats,
  type FollowCreatorInput,
  fanSchema,
  fanListSchema,
  fanStatsSchema,
} from '@/types/fan';

// Query keys
export const crmKeys = {
  all: ['crm'] as const,
  fans: () => [...crmKeys.all, 'fans'] as const,
  fansList: (filters: Record<string, unknown>) => [...crmKeys.fans(), filters] as const,
  fan: (id: string) => [...crmKeys.fans(), id] as const,
  stats: () => [...crmKeys.all, 'stats'] as const,
  following: (userId: string) => [...crmKeys.all, 'following', userId] as const,
};

// Get fans list
export async function getFans(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<FanList> {
  const response = await http.get<FanList>('/crm/fans', { params });
  return fanListSchema.parse(response);
}

// Get fan by ID
export async function getFan(id: string): Promise<Fan> {
  const response = await http.get<Fan>(`/crm/fans/${id}`);
  return fanSchema.parse(response);
}

// Get fan stats
export async function getFanStats(): Promise<FanStats> {
  const response = await http.get<FanStats>('/crm/stats');
  return fanStatsSchema.parse(response);
}

// Follow creator
export async function followCreator(input: FollowCreatorInput): Promise<Fan> {
  const response = await http.post<Fan>('/crm/follow', input);
  return fanSchema.parse(response);
}

// Unfollow creator
export async function unfollowCreator(creatorId: string): Promise<void> {
  await http.delete<void>(`/crm/follow/${creatorId}`);
}

// Block fan
export async function blockFan(fanId: string): Promise<Fan> {
  const response = await http.post<Fan>(`/crm/fans/${fanId}/block`);
  return fanSchema.parse(response);
}

// Unblock fan
export async function unblockFan(fanId: string): Promise<Fan> {
  const response = await http.post<Fan>(`/crm/fans/${fanId}/unblock`);
  return fanSchema.parse(response);
}
