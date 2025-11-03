/**
 * Type declarations for jest-axe
 */

declare module 'jest-axe' {
  import type { AxeResults, RunOptions } from 'axe-core';

  export function axe(
    html: Element | Document | string,
    options?: RunOptions
  ): Promise<AxeResults>;

  export function toHaveNoViolations(results: AxeResults): {
    pass: boolean;
    message: () => string;
  };
}

declare global {
  namespace Vi {
    interface Assertion {
      toHaveNoViolations(): void;
    }
    interface AsymmetricMatchersContaining {
      toHaveNoViolations(): void;
    }
  }
}

export {};
