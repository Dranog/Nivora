/**
 * AuthForm Component - F2 Auth & Onboarding
 * Login/Register form with email-only, Zod validation, and toasts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authSchema } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (value: string) => {
    const result = authSchema.safeParse({ email: value });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleBlur = () => {
    setTouched({ ...touched, email: true });
    validateEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true });

    // Validate input with Zod
    if (!validateEmail(email)) {
      return;
    }

    try {
      const user = await login({ email });

      toast({
        title: 'Welcome!',
        description: `Logged in as ${user.email}`,
      });

      // Redirect based on onboarding status
      if (!user.onboardingDone) {
        router.push('/onboarding');
      } else {
        router.push(`/${user.role}`);
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleBlur}
          disabled={isLoading}
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={touched.email && errors.email ? 'border-destructive' : ''}
        />
        {touched.email && errors.email && (
          <p
            id="email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.email}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Enter your email to login or create an account
        </p>
      </div>

      <Button
        type="submit"
        variant="default"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Continue with Email'
        )}
      </Button>
    </form>
  );
}
