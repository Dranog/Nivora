/**
 * Fan CRM API Client (F8)
 */

import type {
  FansListResponse,
  FanFilters,
  Fan,
  Note,
  FanTag,
  AddNoteRequest,
  UpdateNoteRequest,
  AddTagRequest,
  RemoveTagRequest,
  ChangeStageRequest,
  CreateTagRequest,
} from '@/types/crm';

const API_BASE = '/api/crm';

/**
 * Get fans list with filters
 */
export async function getFans(filters: FanFilters = {}): Promise<FansListResponse> {
  const params = new URLSearchParams();

  if (filters.stage) params.set('stage', filters.stage);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  if (filters.search) params.set('search', filters.search);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE}/fans?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch fans');
  }

  return response.json();
}

/**
 * Get fan by ID
 */
export async function getFanById(id: string): Promise<Fan> {
  const response = await fetch(`${API_BASE}/fans/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch fan');
  }

  return response.json();
}

/**
 * Add note to fan
 */
export async function addNote(data: AddNoteRequest): Promise<Note> {
  const response = await fetch(`${API_BASE}/fans/${data.fanId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: data.content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to add note');
  }

  return response.json();
}

/**
 * Update note
 */
export async function updateNote(data: UpdateNoteRequest): Promise<Note> {
  const response = await fetch(`${API_BASE}/notes/${data.noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: data.content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to update note');
  }

  return response.json();
}

/**
 * Add tag to fan
 */
export async function addTag(data: AddTagRequest): Promise<Fan> {
  const response = await fetch(`${API_BASE}/fans/${data.fanId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId: data.tagId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to add tag');
  }

  return response.json();
}

/**
 * Remove tag from fan
 */
export async function removeTag(data: RemoveTagRequest): Promise<Fan> {
  const response = await fetch(`${API_BASE}/fans/${data.fanId}/tags/${data.tagId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to remove tag');
  }

  return response.json();
}

/**
 * Change fan stage
 */
export async function changeStage(data: ChangeStageRequest): Promise<Fan> {
  const response = await fetch(`${API_BASE}/fans/${data.fanId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage: data.stage }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to change stage');
  }

  return response.json();
}

/**
 * Get available tags
 */
export async function getTags(): Promise<FanTag[]> {
  const response = await fetch(`${API_BASE}/tags`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tags');
  }

  return response.json();
}

/**
 * Create new tag
 */
export async function createTag(data: CreateTagRequest): Promise<FanTag> {
  const response = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to create tag');
  }

  return response.json();
}

/**
 * Export fans to CSV
 */
export async function exportFansCSV(filters: FanFilters = {}): Promise<Blob> {
  const params = new URLSearchParams();

  if (filters.stage) params.set('stage', filters.stage);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  if (filters.search) params.set('search', filters.search);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  const response = await fetch(`${API_BASE}/fans/export?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to export fans');
  }

  return response.blob();
}
