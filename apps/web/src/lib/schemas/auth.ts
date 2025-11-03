/**
 * Auth Schemas - F2 Auth & Onboarding
 * Zod validation schemas for authentication
 */

import { z } from 'zod';

// Login/Register schema (email-only)
export const authSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string().optional(), // Optional for email-only flow
});

export type AuthInput = z.infer<typeof authSchema>;

// User role schema
export const userRoleSchema = z.enum(['fan', 'creator', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User response schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: userRoleSchema.nullable(), // Nullable for users who haven't completed onboarding
  onboardingDone: z.boolean(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

// Login response schema
export const loginResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// API error schema
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

// Onboarding input schema
export const onboardingSchema = z.object({
  role: userRoleSchema,
  displayName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
