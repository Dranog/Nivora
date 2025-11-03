/**
 * Fake RequestAnimationFrame - F5 Anti-Leak Tests
 * Deterministic RAF for testing animations
 */

import { vi } from 'vitest';

let rafCallbacks: Array<{ id: number; callback: FrameRequestCallback }> = [];
let rafId = 0;

export const raf = {
  request: vi.fn((callback: FrameRequestCallback): number => {
    const id = ++rafId;
    rafCallbacks.push({ id, callback });
    return id;
  }),

  cancel: vi.fn((id: number): void => {
    rafCallbacks = rafCallbacks.filter((cb) => cb.id !== id);
  }),

  /**
   * Execute all pending RAF callbacks
   */
  tick: (): void => {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach(({ callback }) => {
      callback(performance.now());
    });
  },

  /**
   * Clear all pending RAF callbacks
   */
  clear: (): void => {
    rafCallbacks = [];
    rafId = 0;
  },
};
