/**
 * Fake setInterval/clearInterval for deterministic testing
 * Works with mocked clock (clock.now)
 */

import { vi } from 'vitest';

interface IntervalCallback {
  id: number;
  callback: () => void;
  intervalMs: number;
  lastRun: number;
}

let intervals: IntervalCallback[] = [];
let intervalId = 0;
let startTime = 0;

export const interval = {
  /**
   * Mock setInterval - stores callback and interval
   */
  set: vi.fn((callback: () => void, ms: number): number => {
    const id = ++intervalId;
    intervals.push({
      id,
      callback,
      intervalMs: ms,
      lastRun: startTime,
    });
    return id;
  }),

  /**
   * Mock clearInterval - removes callback
   */
  clear: vi.fn((id: number): void => {
    intervals = intervals.filter((i) => i.id !== id);
  }),

  /**
   * Manually tick intervals - runs callbacks that should fire based on elapsed time
   * @param currentTime - current time in ms (from mocked clock)
   */
  tick: (currentTime: number): void => {
    intervals.forEach((i) => {
      const elapsed = currentTime - i.lastRun;
      if (elapsed >= i.intervalMs) {
        i.callback();
        i.lastRun = currentTime;
      }
    });
  },

  /**
   * Clear all intervals
   */
  clearAll: (): void => {
    intervals = [];
    intervalId = 0;
    startTime = 0;
  },

  /**
   * Set start time for interval tracking
   */
  setStartTime: (time: number): void => {
    startTime = time;
  },
};
