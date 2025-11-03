/**
 * Auth Layout - F2 Auth & Onboarding
 * Simple centered layout for auth pages
 */

import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-accent/20">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">
          <span className="text-primary">F2</span> Auth
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the platform
        </p>
      </div>

      {/* Content */}
      {children}

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2025 F2 Auth. All rights reserved.</p>
      </footer>
    </div>
  );
}
