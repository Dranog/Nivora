/**
 * Auth API - F2 Auth & Onboarding + F3 Query Keys
 * API stubs with fetch + Zod validation
 */

import {
  authSchema,
  type AuthInput,
  loginResponseSchema,
  type LoginResponse,
  userSchema,
  type User,
  type UserRole,
  onboardingSchema,
  type OnboardingInput,
} from '@/lib/schemas/auth';

// Mock API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock storage for demo purposes (exported for test seeding)
export const MOCK_USERS: Record<string, User> = {
  'fan@example.com': {
    id: 'user-fan-1',
    email: 'fan@example.com',
    role: 'fan',
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  },
  'creator@example.com': {
    id: 'user-creator-1',
    email: 'creator@example.com',
    role: 'creator',
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  },
  'admin@example.com': {
    id: 'user-admin-1',
    email: 'admin@example.com',
    role: 'admin',
    onboardingDone: true,
    createdAt: new Date().toISOString(),
  },
};

/**
 * Login or register user (email-only)
 */
export async function login(input: AuthInput): Promise<LoginResponse> {
  // Validate input
  const validated = authSchema.parse(input);

  // Simulate API delay
  await delay(800);

  // Mock: Get or create user
  let user = MOCK_USERS[validated.email];

  if (!user) {
    // Auto-register new user as fan (default role)
    user = {
      id: `user-${Date.now()}`,
      email: validated.email,
      role: 'fan',
      onboardingDone: false,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS[validated.email] = user;
  }

  // Mock token
  const token = `mock-jwt-${user.id}-${Date.now()}`;

  // Store token in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }

  // Validate response
  const response = loginResponseSchema.parse({
    user,
    token,
  });

  return response;
}

/**
 * Register user with specific role (for demo purposes)
 */
export async function register(
  input: AuthInput & { role?: UserRole }
): Promise<LoginResponse> {
  const validated = authSchema.parse(input);

  await delay(800);

  // Create new user with specified role
  const user: User = {
    id: `user-${Date.now()}`,
    email: validated.email,
    role: input.role || 'fan',
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  };

  MOCK_USERS[validated.email] = user;

  const token = `mock-jwt-${user.id}-${Date.now()}`;

  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }

  return loginResponseSchema.parse({ user, token });
}

/**
 * Get current authenticated user
 */
export async function fetchMe(): Promise<User> {
  await delay(300);

  // Get token from localStorage
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  if (!token) {
    throw new Error('Not authenticated');
  }

  // Extract user ID from mock token
  const userId = token.split('-')[2];

  // Find user by token
  const user = Object.values(MOCK_USERS).find((u) => u.id.includes(userId));

  if (!user) {
    throw new Error('User not found');
  }

  return userSchema.parse(user);
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await delay(200);

  // Remove token from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  input: OnboardingInput
): Promise<User> {
  const validated = onboardingSchema.parse(input);

  await delay(500);

  // Get current user
  const user = await fetchMe();

  // Update user onboarding status
  const updatedUser: User = {
    ...user,
    role: validated.role,
    onboardingDone: true,
  };

  // Update mock storage
  MOCK_USERS[user.email] = updatedUser;

  return userSchema.parse(updatedUser);
}

/**
 * OAuth login (mock)
 */
export async function oauthLogin(
  provider: 'google' | 'github'
): Promise<LoginResponse> {
  await delay(1000);

  // Mock OAuth user
  const user: User = {
    id: `user-${provider}-${Date.now()}`,
    email: `user@${provider}.com`,
    role: 'fan',
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  };

  MOCK_USERS[user.email] = user;

  const token = `mock-jwt-${user.id}-${Date.now()}`;

  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }

  return loginResponseSchema.parse({ user, token });
}

// F3 Query keys for React Query
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};
