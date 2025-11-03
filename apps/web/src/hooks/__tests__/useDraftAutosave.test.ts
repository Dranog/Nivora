/**
 * Draft Autosave Hook Tests - F4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDraftAutosave } from '../useDraftAutosave';
import type { DraftState } from '@/types/creator';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useDraftAutosave', () => {
  const draftId = 'test-draft-123';

  const mockDraft: Omit<DraftState, 'savedAt'> = {
    title: 'Test Post',
    content: 'Test content',
    visibility: 'free',
    tags: ['test'],
    nsfw: false,
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('saves draft to localStorage after debounce delay', () => {
    const { result } = renderHook(() => useDraftAutosave(draftId, mockDraft, true));

    // Wait for debounce delay (800ms)
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Check immediately after advancing timers
    const stored = localStorageMock.getItem(`draft-${draftId}`);
    expect(stored).toBeTruthy();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.title).toBe('Test Post');
      expect(parsed.content).toBe('Test content');
      expect(parsed.savedAt).toBeTruthy();
    }
  });

  it('does not save if draft has not changed', async () => {
    const { rerender } = renderHook(
      ({ draft }) => useDraftAutosave(draftId, draft, true),
      { initialProps: { draft: mockDraft } }
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const firstSave = localStorageMock.getItem(`draft-${draftId}`);
    expect(firstSave).toBeTruthy();

    // Rerender with same draft
    rerender({ draft: mockDraft });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const secondSave = localStorageMock.getItem(`draft-${draftId}`);
    expect(secondSave).toBe(firstSave); // Should be same
  });

  it('loads draft from localStorage', async () => {
    // Pre-populate localStorage
    const existingDraft: DraftState = {
      ...mockDraft,
      title: 'Existing Draft',
      savedAt: new Date().toISOString(),
    };
    localStorageMock.setItem(`draft-${draftId}`, JSON.stringify(existingDraft));

    const { result } = renderHook(() => useDraftAutosave(draftId, mockDraft, true));

    const loaded = result.current.loadDraft();
    expect(loaded).toBeTruthy();
    expect(loaded?.title).toBe('Existing Draft');
  });

  it('clears draft from localStorage', async () => {
    // Pre-populate localStorage
    const existingDraft: DraftState = {
      ...mockDraft,
      savedAt: new Date().toISOString(),
    };
    localStorageMock.setItem(`draft-${draftId}`, JSON.stringify(existingDraft));

    const { result } = renderHook(() => useDraftAutosave(draftId, mockDraft, true));

    act(() => {
      result.current.clearDraft();
    });

    const stored = localStorageMock.getItem(`draft-${draftId}`);
    expect(stored).toBeNull();
  });

  it('does not save when disabled', async () => {
    renderHook(() => useDraftAutosave(draftId, mockDraft, false));

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const stored = localStorageMock.getItem(`draft-${draftId}`);
    expect(stored).toBeNull();
  });

  it('updates draft when content changes', () => {
    const { rerender } = renderHook(
      ({ draft }) => useDraftAutosave(draftId, draft, true),
      { initialProps: { draft: mockDraft } }
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Change content
    const updatedDraft = { ...mockDraft, title: 'Updated Title' };
    rerender({ draft: updatedDraft });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Check immediately after advancing timers
    const stored = localStorageMock.getItem(`draft-${draftId}`);
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.title).toBe('Updated Title');
    }
  });
});
