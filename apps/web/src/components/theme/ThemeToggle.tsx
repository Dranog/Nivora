'use client';

/**
 * ThemeToggle - F0 Foundation
 * Accessible theme switcher with keyboard navigation
 * Cycles through: system → light → dark → system
 */

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md w-9 h-9 bg-transparent"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const label = theme === 'dark'
    ? 'Dark mode'
    : theme === 'light'
    ? 'Light mode'
    : 'System theme';

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-md w-9 h-9
                 hover:bg-accent hover:text-accent-foreground
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-ring focus-visible:ring-offset-2
                 focus-visible:ring-offset-background
                 transition-colors duration-200"
      aria-label={`${label}. Click to cycle theme`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
