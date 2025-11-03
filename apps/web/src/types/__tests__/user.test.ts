/**
 * User Zod Schema Tests - F3
 */

import { describe, it, expect } from 'vitest';
import { userSchema, updateUserInputSchema, userListSchema } from '../user';

describe('User Schema', () => {
  describe('userSchema', () => {
    it('validates a valid user object', () => {
      const validUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'fan',
        onboardingDone: true,
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Hello world',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe('fan');
      }
    });

    it('allows nullable role for users without onboarding', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: null,
        onboardingDone: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = userSchema.safeParse(user);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBeNull();
      }
    });

    it('rejects invalid email format', () => {
      const invalidUser = {
        id: 'user-123',
        email: 'not-an-email',
        role: 'fan',
        onboardingDone: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('rejects invalid role', () => {
      const invalidUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'invalid-role',
        onboardingDone: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role');
      }
    });

    it('requires mandatory fields', () => {
      const incompleteUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const result = userSchema.safeParse(incompleteUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('updateUserInputSchema', () => {
    it('validates a valid update input', () => {
      const validInput = {
        displayName: 'New Name',
        bio: 'Updated bio',
      };

      const result = updateUserInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects displayName that is too short', () => {
      const invalidInput = {
        displayName: 'A',
      };

      const result = updateUserInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('rejects bio that is too long', () => {
      const invalidInput = {
        bio: 'a'.repeat(501),
      };

      const result = updateUserInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('accepts empty update (all fields optional)', () => {
      const emptyInput = {};

      const result = updateUserInputSchema.safeParse(emptyInput);
      expect(result.success).toBe(true);
    });
  });

  describe('userListSchema', () => {
    it('validates a valid user list response', () => {
      const validList = {
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            role: 'fan',
            onboardingDone: true,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            role: 'creator',
            onboardingDone: false,
            createdAt: '2024-01-02T00:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      };

      const result = userListSchema.safeParse(validList);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.length).toBe(2);
        expect(result.data.total).toBe(2);
      }
    });
  });
});
