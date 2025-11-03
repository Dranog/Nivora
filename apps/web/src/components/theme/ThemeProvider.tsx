'use client';

/**
 * ThemeProvider - F0 Foundation
 * Wraps next-themes with type-safe configuration
 * Provides dark/light mode switching with system preference detection
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps as NextThemesProviderProps } from 'next-themes';

type ThemeProviderProps = Omit<NextThemesProviderProps, 'children'> & {
  children: React.ReactNode;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
