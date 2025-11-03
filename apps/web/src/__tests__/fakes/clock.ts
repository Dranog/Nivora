/**
 * Fake Clock - F5 Anti-Leak Tests
 * Deterministic time for testing
 */

import { vi } from 'vitest';

export const clock = {
  now: vi.fn(() => 0),
};
