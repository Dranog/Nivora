/**
 * Auth Flow Tests - F2 Auth & Onboarding
 * Test complete auth flow: login → onboarding → dashboard
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthForm } from '@/components/auth/AuthForm';
import { OnboardingSteps } from '@/components/auth/OnboardingSteps';
import * as authApi from '@/lib/api/auth';
import { MOCK_USERS } from '@/lib/api/auth';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('Auth Flow', () => {
  beforeEach(() => {
    // Clear mocks first
    mockPush.mockClear();
    vi.clearAllMocks();

    // Reset store completely (including persisted state)
    useAuthStore.getState().reset();

    // Clear localStorage to ensure clean state
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Login Flow', () => {
    it('logs in with valid email', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /continue with email/i });

      // Enter email and submit
      await user.type(emailInput, 'fan@example.com');
      await user.click(submitButton);

      // Wait for API call and store update
      await waitFor(() => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.email).toBe('fan@example.com');
        expect(state.role).toBe('fan');
      });
    });

    it('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);

      // Enter invalid email and trigger blur
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      // Should show validation error
      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent(/invalid email/i);

      // Should not be authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const submitButton = screen.getByRole('button', { name: /continue with email/i });

      // Submit without email
      await user.click(submitButton);

      // Should show validation error (Zod returns "Invalid email address" for empty string)
      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent(/email|required/i);
    });

    it('disables button and shows spinner during submission', async () => {
      const user = userEvent.setup();

      // Mock slow API
      const loginSpy = vi.spyOn(authApi, 'login').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => {
          resolve({
            user: {
              id: 'test-123',
              email: 'test@example.com',
              role: 'fan',
              onboardingDone: false,
              createdAt: new Date().toISOString(),
            },
            token: 'mock-token',
          });
        }, 500))
      );

      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /continue with email/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Button should be disabled with spinner
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });

      // Cleanup
      loginSpy.mockRestore();
    });
  });

  describe('Onboarding Flow', () => {
    beforeEach(() => {
      // Add test user to mock database
      MOCK_USERS['test@example.com'] = {
        id: 'test-user-123',
        email: 'test@example.com',
        role: null,
        onboardingDone: false,
        createdAt: new Date().toISOString(),
      };

      // Set authenticated but not onboarded
      useAuthStore.setState({
        isAuthenticated: true,
        role: null,
        onboardingDone: false,
        userId: 'test-user-123',
        email: 'test@example.com',
        isLoading: false,
        error: null,
      });

      // Set token in localStorage for API calls
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', 'mock-jwt-test-user-123-12345');
      }
    });

    it('completes onboarding flow with role selection', async () => {
      const user = userEvent.setup();
      render(<OnboardingSteps />);

      // Step 1: Select role
      expect(screen.getByText(/choose your role/i)).toBeInTheDocument();

      const fanButton = screen.getByRole('button', { name: /fan discover and support creators/i });
      await user.click(fanButton);

      // Should show selected state
      expect(fanButton).toHaveAttribute('aria-pressed', 'true');

      // Click Next
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Step 2: Welcome
      await waitFor(() => {
        expect(screen.getByText(/welcome!/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3: All Set
      await waitFor(() => {
        expect(screen.getByText(/all set!/i)).toBeInTheDocument();
      });

      // Complete onboarding
      const completeButton = screen.getByRole('button', { name: /complete setup/i });
      await user.click(completeButton);

      // Wait for completion (API call + store update)
      await waitFor(
        () => {
          const state = useAuthStore.getState();
          expect(state.onboardingDone).toBe(true);
          expect(state.role).toBe('fan');
        },
        { timeout: 3000 }
      );
    });

    it('requires role selection to proceed', async () => {
      render(<OnboardingSteps />);

      // Try to click Next without selecting role
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('allows navigating back through steps', async () => {
      const user = userEvent.setup();
      render(<OnboardingSteps />);

      // Select role and go to step 2
      const fanButton = screen.getByRole('button', { name: /fan discover and support creators/i });
      await user.click(fanButton);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/welcome!/i)).toBeInTheDocument();
      });

      // Click Previous
      const previousButton = screen.getByRole('button', { name: /previous/i });
      await user.click(previousButton);

      // Should be back on step 1
      await waitFor(() => {
        expect(screen.getByText(/choose your role/i)).toBeInTheDocument();
      });
    });

    it('shows progress bar correctly', () => {
      render(<OnboardingSteps />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    });
  });

  describe('Complete Flow: Login → Onboarding → Dashboard', () => {
    it('redirects new user through onboarding to dashboard', async () => {
      const userInteraction = userEvent.setup();

      // Step 1: Login
      const { unmount } = render(<AuthForm />);

      await userInteraction.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await userInteraction.click(screen.getByRole('button', { name: /continue with email/i }));

      await waitFor(
        () => {
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(true);
          expect(state.email).toBe('newuser@example.com');
        },
        { timeout: 3000 }
      );

      // Should have redirected to onboarding (checked via mockPush)
      expect(mockPush).toHaveBeenCalledWith('/onboarding');

      // Step 2: Onboarding
      mockPush.mockClear();
      unmount();

      // Render onboarding as a new page (use render, not rerender after unmount)
      render(<OnboardingSteps />);

      const fanButton = await screen.findByRole('button', { name: /fan discover and support creators/i });
      await userInteraction.click(fanButton);

      // Go through all steps
      await userInteraction.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/welcome!/i)).toBeInTheDocument());

      await userInteraction.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.getByText(/all set!/i)).toBeInTheDocument());

      await userInteraction.click(screen.getByRole('button', { name: /complete setup/i }));

      // Should redirect to dashboard
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/fan');
          expect(useAuthStore.getState().onboardingDone).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('redirects existing user directly to dashboard', async () => {
      const userInteraction = userEvent.setup();

      // Login with existing user who completed onboarding
      render(<AuthForm />);

      await userInteraction.type(screen.getByLabelText(/email/i), 'admin@example.com');
      await userInteraction.click(screen.getByRole('button', { name: /continue with email/i }));

      await waitFor(
        () => {
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(true);
          expect(state.email).toBe('admin@example.com');
          expect(state.onboardingDone).toBe(true);
        },
        { timeout: 3000 }
      );

      // Should redirect directly to dashboard (admin already onboarded)
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Zod Validation', () => {
    it('validates email format correctly', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
      ];

      for (const email of invalidEmails) {
        const user = userEvent.setup();
        const { unmount } = render(<AuthForm />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, email);
        await user.tab(); // Trigger blur

        // Should show validation error
        const errorMessage = await screen.findByRole('alert');
        expect(errorMessage).toHaveTextContent(/invalid email/i);

        // Cleanup for next iteration
        unmount();
      }
    });

    it('accepts valid email format user@example.com', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');
      await user.click(screen.getByRole('button', { name: /continue with email/i }));

      // Wait for login to complete
      await waitFor(
        () => {
          const state = useAuthStore.getState();
          expect(state.email).toBe('user@example.com');
          expect(state.isAuthenticated).toBe(true);
        },
        { timeout: 3000 }
      );

      // Should not show validation error
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('accepts valid email format with subdomain', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test.user@example.co.uk');
      await user.click(screen.getByRole('button', { name: /continue with email/i }));

      // Wait for login to complete
      await waitFor(
        () => {
          const state = useAuthStore.getState();
          expect(state.email).toBe('test.user@example.co.uk');
          expect(state.isAuthenticated).toBe(true);
        },
        { timeout: 3000 }
      );

      // Should not show validation error
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
