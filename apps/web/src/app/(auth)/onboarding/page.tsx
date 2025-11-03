/**
 * Onboarding Page - F2 Auth & Onboarding
 * Multi-step onboarding flow using OnboardingSteps component
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { OnboardingSteps } from '@/components/auth/OnboardingSteps';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, onboardingDone, role } = useAuthStore();

  // Redirect if not authenticated or already completed onboarding
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else if (onboardingDone) {
      router.push(`/${role}`);
    }
  }, [isAuthenticated, onboardingDone, role, router]);

  // Don't render if not authenticated or onboarding already done
  if (!isAuthenticated || onboardingDone) {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <OnboardingSteps />
    </div>
  );
}
