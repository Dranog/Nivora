/**
 * Auth Page - F2 Auth & Onboarding
 * Login/Register page with email + OAuth
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthForm } from '@/components/auth/AuthForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, onboardingDone, role } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!onboardingDone) {
        router.push('/onboarding');
      } else {
        router.push(`/${role}`);
      }
    }
  }, [isAuthenticated, onboardingDone, role, router]);

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <AuthForm />
        <OAuthButtons />

        {/* Demo Hint */}
        <div className="bg-accent/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Demo:</strong> Use any email to login
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try: fan@example.com, creator@example.com, or admin@example.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
