/**
 * OnboardingSteps Component - F2 Auth & Onboarding
 * Multi-step onboarding flow with role selection
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { type UserRole } from '@/lib/schemas/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Heart, Palette, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepsProps {
  initialRole?: UserRole;
}

export function OnboardingSteps({ initialRole }: OnboardingStepsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { completeOnboarding, isLoading, role: currentRole } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialRole || currentRole || null
  );

  const totalSteps = 3;

  const roles: Array<{
    value: UserRole;
    label: string;
    description: string;
    icon: typeof Heart;
  }> = [
    {
      value: 'fan',
      label: 'Fan',
      description: 'Discover and support creators',
      icon: Heart,
    },
    {
      value: 'creator',
      label: 'Creator',
      description: 'Share your content and grow your audience',
      icon: Palette,
    },
  ];

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast({
        title: 'Role required',
        description: 'Please select your role to continue',
        variant: 'destructive',
      });
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!selectedRole) {
      toast({
        title: 'Role required',
        description: 'Please select your role',
        variant: 'destructive',
      });
      return;
    }

    try {
      const user = await completeOnboarding({
        role: selectedRole,
      });

      toast({
        title: 'Welcome aboard!',
        description: 'Your account is ready',
      });

      router.push(`/${user.role}`);
    } catch (error) {
      toast({
        title: 'Onboarding failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Choose Your Role</h2>
              <p className="text-muted-foreground">
                Select how you want to use the platform
              </p>
            </div>

            <div className="grid gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      'flex items-start gap-4 p-4 border-2 rounded-lg text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={cn(
                        'rounded-full p-2',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold cursor-pointer">
                          {role.label}
                        </Label>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold">Welcome!</h2>
              <p className="text-muted-foreground">
                You&apos;ve selected the <strong className="capitalize">{selectedRole}</strong> role
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6 space-y-3">
              <h3 className="font-semibold">What&apos;s next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Complete your profile setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Explore the platform features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Start using your personalized dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold">All Set!</h2>
              <p className="text-muted-foreground">
                You&apos;re ready to start using the platform
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 text-center space-y-2">
              <p className="font-medium">Let&apos;s get started!</p>
              <p className="text-sm text-muted-foreground">
                Click the button below to access your dashboard
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Get Started</CardTitle>
        <CardDescription>
          Step {step} of {totalSteps}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-accent rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label={`Step ${step} of ${totalSteps}`}
          />
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              disabled={!selectedRole}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={handleComplete}
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
        </div>

        {/* Skip Option */}
        {step < totalSteps && (
          <div className="text-center">
            <button
              onClick={() => setStep(totalSteps)}
              className="text-sm text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              disabled={!selectedRole}
            >
              Skip to end
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
