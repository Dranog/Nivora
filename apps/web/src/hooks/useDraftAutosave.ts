/**
 * Draft Autosave Hook - F4
 * Autosaves draft to localStorage with 800ms debounce
 */

import { useEffect, useRef, useCallback } from 'react';
import type { DraftState } from '@/types/creator';
import { draftStateSchema } from '@/types/creator';

const AUTOSAVE_DELAY = 800; // ms

export function useDraftAutosave(
  draftId: string,
  draft: Omit<DraftState, 'savedAt'>,
  enabled: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDraftRef = useRef<string>('');

  // Get draft key for localStorage
  const getDraftKey = useCallback((id: string) => {
    return `draft-${id}`;
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(
    (data: DraftState) => {
      if (typeof window === 'undefined') return;

      try {
        const validated = draftStateSchema.parse(data);
        localStorage.setItem(getDraftKey(draftId), JSON.stringify(validated));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    },
    [draftId, getDraftKey]
  );

  // Load draft from localStorage
  const loadDraft = useCallback((): DraftState | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(getDraftKey(draftId));
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return draftStateSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [draftId, getDraftKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(getDraftKey(draftId));
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [draftId, getDraftKey]);

  // Debounced autosave effect
  useEffect(() => {
    if (!enabled) return;

    // Check if draft has changed
    const currentDraft = JSON.stringify(draft);
    if (currentDraft === previousDraftRef.current) return;

    previousDraftRef.current = currentDraft;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(() => {
      const draftWithTimestamp: DraftState = {
        ...draft,
        savedAt: new Date().toISOString(),
      };
      saveDraft(draftWithTimestamp);
    }, AUTOSAVE_DELAY);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draft, enabled, saveDraft]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
  };
}
