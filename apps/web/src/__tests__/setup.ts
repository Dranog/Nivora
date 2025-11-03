/**
 * Test Setup - F0 Foundation + F5 Anti-Leak + Commerce
 * Configure testing environment with jsdom, matchers, and MSW
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi, beforeAll, afterAll } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import { clock } from './fakes/clock';
import { raf } from './fakes/raf';
import { server } from './mocks/server';

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

// MSW setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterAll(() => {
  server.close();
});

// Cleanup after each test
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
  raf.clear();
  cleanup();
});

// Mock window.matchMedia for theme tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Element.prototype.hasPointerCapture and related methods for Radix Select
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Mock DataTransfer for file upload tests
if (typeof DataTransfer === 'undefined') {
  (global as any).DataTransfer = class DataTransfer {
    items: any;
    files: File[] = [];

    constructor() {
      const self = this;
      this.items = {
        add(file: File) {
          self.files.push(file);
        },
      };
    }
  };
}

// Mock HTMLMediaElement for video/audio tests
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
  configurable: true,
  writable: true,
  value: vi.fn().mockReturnValue('probably'),
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 0);
  return 0;
});

global.cancelAnimationFrame = vi.fn();
