import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency (cents to display)
 * @example formatCurrency(1234, 'EUR') => '€12.34'
 */
export function formatCurrency(
  cents: number,
  currency: 'EUR' | 'USD' | 'GBP' = 'EUR'
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Format crypto amount
 * @example formatCrypto(123456789, 'USDC') => '123.46 USDC'
 */
export function formatCrypto(
  amount: number,
  currency: 'USDC' | 'USDT' | 'ETH',
  decimals = 6
): string {
  const value = amount / Math.pow(10, decimals)
  return `${value.toFixed(2)} ${currency}`
}

/**
 * Format date relative or absolute
 * @example formatDate('2024-01-15') => '15 jan. 2024'
 */
export function formatDate(
  date: string | Date,
  options?: { relative?: boolean }
): string {
  const d = new Date(date)
  
  if (options?.relative) {
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Il y a ${diffHours}h`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Il y a ${diffDays}j`
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/**
 * Format number with K/M suffix
 * @example formatNumber(1234) => '1.2K'
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

/**
 * Format percentage
 * @example formatPercent(0.1234) => '+12.3%'
 */
export function formatPercent(value: number, showSign = true): string {
  const formatted = (value * 100).toFixed(1) + '%'
  if (showSign && value > 0) return '+' + formatted
  return formatted
}

/**
 * Slugify string for URLs
 * @example slugify('Hello World!') => 'hello-world'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text with ellipsis
 * @example truncate('Hello World', 8) => 'Hello...'
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sleep/delay utility
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 * @example capitalize("hello world") // "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get initials from a full name
 * @param name - Full name (e.g., "John Doe")
 * @returns Initials in uppercase (e.g., "JD")
 * @example getInitials("John Doe") // "JD"
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === "") return "";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a random unique ID
 * @param prefix - Optional prefix for the ID (e.g., "user")
 * @returns Random ID string (e.g., "user_a7b3c9d2")
 * @example randomId("post") // "post_f4e8a1b6"
 */
export function randomId(prefix?: string): string {
  const random = Math.random().toString(36).substring(2, 10);
  return prefix ? `${prefix}_${random}` : random;
}
