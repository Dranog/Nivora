/**
 * Fan CRM Hooks (F8)
 * With debounce on search (300ms) and autosave on notes (800ms)
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api/fan-crm';
import type {
  FanFilters,
  Fan,
  FanTag,
  AddNoteRequest,
  UpdateNoteRequest,
  AddTagRequest,
  RemoveTagRequest,
  ChangeStageRequest,
  CreateTagRequest,
} from '@/types/crm';

/**
 * Get fans list with debounced search
 */
export function useFans(filters: FanFilters = {}) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce search (300ms)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters]);

  return useQuery({
    queryKey: ['crm', 'fans', debouncedFilters],
    queryFn: () => api.getFans(debouncedFilters),
    staleTime: 30000, // 30s
  });
}

/**
 * Get fan by ID
 */
export function useFan(id: string) {
  return useQuery({
    queryKey: ['crm', 'fans', id],
    queryFn: () => api.getFanById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Get available tags
 */
export function useTags() {
  return useQuery({
    queryKey: ['crm', 'tags'],
    queryFn: api.getTags,
    staleTime: 60000, // 1min
  });
}

/**
 * Add note mutation
 */
export function useAddNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.addNote,
    onSuccess: (data: any) => {
      // Invalidate fan queries
      queryClient.invalidateQueries({ queryKey: ['crm', 'fans'], exact: false });

      toast({
        title: 'Note Added',
        description: 'Your note has been saved.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Note',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update note mutation with autosave (800ms debounce)
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mutation = useMutation({
    mutationFn: api.updateNote,
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'fans'], exact: false });
      setIsSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Note',
        description: error.message,
        variant: 'destructive',
      });
      setIsSaving(false);
    },
  });

  const debouncedUpdate = useCallback(
    (data: UpdateNoteRequest) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        mutation.mutate(data);
      }, 800);
    },
    [mutation]
  );

  return {
    ...mutation,
    debouncedUpdate,
    isSaving,
  };
}

/**
 * Add tag mutation
 */
export function useAddTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.addTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'fans'], exact: false });

      toast({
        title: 'Tag Added',
        description: 'Tag has been added to fan.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove tag mutation
 */
export function useRemoveTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.removeTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'fans'], exact: false });

      toast({
        title: 'Tag Removed',
        description: 'Tag has been removed from fan.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Remove Tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Change stage mutation
 */
export function useChangeStage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.changeStage,
    onSuccess: (data: Fan) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'fans'], exact: false });

      toast({
        title: 'Stage Changed',
        description: `Fan moved to ${data.stage} stage.`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Change Stage',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create tag mutation
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'tags'], exact: false });

      toast({
        title: 'Tag Created',
        description: 'New tag has been created.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Export fans to CSV
 */
export function useExportFans() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.exportFansCSV,
    onSuccess: (blob: Blob, filters: FanFilters) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fans-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Fans have been exported to CSV.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
