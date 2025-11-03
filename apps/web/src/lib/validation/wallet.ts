/**
 * Wallet & Payout Validation Schemas
 */

import { z } from 'zod';
import { MIN_PAYOUT_AMOUNT } from '@/types/wallet';

// IBAN validation (simplified - FR format)
export const ibanSchema = z
  .string()
  .trim()
  .min(1, 'IBAN is required')
  .regex(/^FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/, 'Invalid IBAN format (FR76 1234 5678 9012 3456 7890 12)')
  .transform((val) => val.replace(/\s/g, '')); // Remove spaces

// Crypto address validation (ETH/USDT - 0x...)
export const cryptoAddressSchema = z
  .string()
  .trim()
  .min(1, 'Crypto address is required')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid crypto address format (must start with 0x and be 42 characters)');

// Crypto network
export const cryptoNetworkSchema = z.enum(['ETH', 'USDT']);

// Payout mode
export const payoutModeSchema = z.enum(['standard', 'express', 'crypto']);

// Payout amount
export const payoutAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .min(MIN_PAYOUT_AMOUNT, `Minimum payout amount is €${MIN_PAYOUT_AMOUNT}`)
  .refine((val) => Number.isFinite(val), 'Amount must be a valid number');

// Destination (IBAN)
export const ibanDestinationSchema = z.object({
  type: z.literal('iban'),
  iban: ibanSchema,
});

// Destination (Crypto)
export const cryptoDestinationSchema = z.object({
  type: z.literal('crypto'),
  cryptoAddress: cryptoAddressSchema,
  cryptoNetwork: cryptoNetworkSchema,
});

// Payout destination (union)
export const payoutDestinationSchema = z.discriminatedUnion('type', [
  ibanDestinationSchema,
  cryptoDestinationSchema,
]);

// Create payout request
export const createPayoutRequestSchema = z.object({
  mode: payoutModeSchema,
  amount: payoutAmountSchema,
  destination: payoutDestinationSchema,
});

// Helper: Format IBAN for display (masked)
export function formatIbanMasked(iban: string): string {
  // FR76 1234 5678 9012 3456 7890 12 -> FR76 **** **** **** **** **** 12
  const clean = iban.replace(/\s/g, '');
  if (clean.length < 27) return iban;

  const country = clean.slice(0, 2);
  const check = clean.slice(2, 4);
  const last2 = clean.slice(-2);

  return `${country}${check} **** **** **** **** **** ${last2}`;
}

// Helper: Format crypto address for display (truncated)
export function formatCryptoAddress(address: string): string {
  // 0x1234...5678
  if (address.length < 42) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
