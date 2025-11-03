/**
 * CRM Types
 */

export type FanStage = 'lead' | 'customer' | 'vip' | 'churned';

export interface FanTag {
  id: string;
  name: string;
  color: string;
}

export interface Purchase {
  id: string;
  type: 'ppv' | 'tip' | 'subscription';
  amount: number;
  date: string; // ISO date
  description: string;
}

export interface Note {
  id: string;
  fanId: string;
  content: string;
  createdAt: string; // ISO date
  createdBy: string; // "You" for mock
}

export interface Fan {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  stage: FanStage;
  tags: FanTag[];
  totalSpent: number;
  lastPurchase?: string; // ISO date
  joinedAt: string; // ISO date
  notes: Note[];
  purchases: Purchase[];
}

export interface FansListResponse {
  fans: Fan[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FanFilters {
  stage?: FanStage;
  tags?: string[]; // tag IDs
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AddNoteRequest {
  fanId: string;
  content: string;
}

export interface UpdateNoteRequest {
  noteId: string;
  content: string;
}

export interface AddTagRequest {
  fanId: string;
  tagId: string;
}

export interface RemoveTagRequest {
  fanId: string;
  tagId: string;
}

export interface ChangeStageRequest {
  fanId: string;
  stage: FanStage;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

// Stage definitions
export const FAN_STAGES: { value: FanStage; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
  { value: 'customer', label: 'Customer', color: 'bg-blue-100 text-blue-800' },
  { value: 'vip', label: 'VIP', color: 'bg-purple-100 text-purple-800' },
  { value: 'churned', label: 'Churned', color: 'bg-red-100 text-red-800' },
];

// Tag colors
export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];
