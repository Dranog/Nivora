// ==========================================
// CORRECTION 1: NEXT.JS VERSION ALIGNMENT
// ==========================================

// apps/web/package.json - UPDATED
{
  "name": "@oliver/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",              // ✅ UPDATED: Now v15
    "react": "^19.0.0",              // ✅ React 19 for Next.js 15
    "react-dom": "^19.0.0",          // ✅ React 19 for Next.js 15
    "@tanstack/react-query": "^5.14.2",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@hookform/resolvers": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.6",
    "isomorphic-dompurify": "^2.4.0",
    "lucide-react": "^0.295.0",
    "react-hook-form": "^7.49.0",
    "recharts": "^2.10.3",
    "socket.io-client": "^4.7.0",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",       // ✅ UPDATED for React 19
    "@types/react-dom": "^19.0.0",   // ✅ UPDATED for React 19
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "^15.0.0", // ✅ UPDATED for Next.js 15
    "eslint-plugin-boundaries": "^4.2.0", // ✅ ADDED
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3"
  }
}

// apps/web/next.config.js - UPDATED FOR NEXT.JS 15
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ❌ REMOVED: swcMinify (always enabled in Next.js 15)
  output: 'standalone',
  experimental: {
    // ❌ REMOVED: serverActions (stable in Next.js 15)
    // ✅ ADDED: New Next.js 15 features
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: [
      'localhost',
      's3.amazonaws.com',
      'oliver-storage.s3.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

// ==========================================
// CORRECTION 2: CLASS-VALIDATOR REMOVAL
// ==========================================

// apps/api/package.json - UPDATED (Remove class-validator)
{
  "name": "@oliver/api",
  "version": "1.0.0",
  "dependencies": {
    "@nestjs/common": "^10.2.10",
    "@nestjs/core": "^10.2.10",
    "@nestjs/platform-express": "^10.2.10",
    "@nestjs/config": "^3.1.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/swagger": "^7.1.16",
    "@nestjs/throttler": "^5.1.1",
    // ❌ REMOVED: class-validator
    // ❌ REMOVED: class-transformer
    "zod": "^3.22.4", // ✅ Single source of truth
    // ... rest of dependencies
  }
}

// ==========================================
// CORRECTION 3: CRYPTO UTILITY CENTRALIZED
// apps/api/src/common/utils/crypto.util.ts
// ==========================================

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Centralized Crypto Utilities
 * All hash/encryption operations must use these functions
 */
export class CryptoUtil {
  // ========================================
  // PASSWORD HASHING (bcrypt)
  // ========================================

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @param rounds - Salt rounds (default: 10)
   */
  static async hashPassword(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare password with hash
   * @param password - Plain text password
   * @param hash - Hashed password
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ========================================
  // SHA-256 HASHING (Audit Log, Blockchain-style)
  // ========================================

  /**
   * Create SHA-256 hash of data
   * Used for audit log blockchain-style hashing
   * @param data - Data to hash (string or object)
   */
  static sha256(data: string | object): string {
    const input = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Create blockchain-style hash for audit log
   * Chains previous hash with current data
   * @param data - Current audit log entry data
   * @param previousHash - Hash from previous entry
   */
  static createAuditLogHash(data: object, previousHash: string = '0'): string {
    const dataString = JSON.stringify(data);
    const combined = `${previousHash}:${dataString}`;
    return this.sha256(combined);
  }

  /**
   * Verify audit log chain integrity
   * @param entries - Array of audit log entries with hashes
   */
  static verifyAuditLogChain(
    entries: Array<{ data: object; hash: string; previousHash: string }>
  ): boolean {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedHash = this.createAuditLogHash(entry.data, entry.previousHash);

      if (expectedHash !== entry.hash) {
        console.error(`Integrity violation at entry ${i}`);
        return false;
      }
    }
    return true;
  }

  // ========================================
  // HMAC SIGNING (Webhooks, API Keys)
  // ========================================

  /**
   * Create HMAC signature
   * Used for webhook verification
   * @param payload - Payload to sign
   * @param secret - Secret key
   */
  static createHmacSignature(payload: string | object, secret: string): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param payload - Original payload
   * @param signature - Signature to verify
   * @param secret - Secret key
   */
  static verifyHmacSignature(
    payload: string | object,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.createHmacSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // ========================================
  // AES ENCRYPTION (Sensitive Data)
  // ========================================

  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param text - Plain text to encrypt
   * @param key - Encryption key (32 bytes)
   */
  static encrypt(text: string, key: string): string {
    const keyBuffer = crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt AES-256-GCM encrypted data
   * @param encryptedText - Encrypted text in format "iv:authTag:data"
   * @param key - Decryption key
   */
  static decrypt(encryptedText: string, key: string): string {
    const keyBuffer = crypto.createHash('sha256').update(key).digest();
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, keyBuffer, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // ========================================
  // RANDOM GENERATION
  // ========================================

  /**
   * Generate cryptographically secure random string
   * @param length - Length of random string
   * @param encoding - Output encoding (default: hex)
   */
  static randomString(length: number = 32, encoding: BufferEncoding = 'hex'): string {
    const bytes = Math.ceil(length / 2);
    return crypto.randomBytes(bytes).toString(encoding).slice(0, length);
  }

  /**
   * Generate UUID v4
   */
  static generateUuid(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate API key
   * Format: oliver_live_xxxxxxxxxxxx (32 chars)
   */
  static generateApiKey(prefix: string = 'oliver_live'): string {
    const random = this.randomString(32);
    return `${prefix}_${random}`;
  }

  // ========================================
  // SECURE COMPARISON (Timing-safe)
  // ========================================

  /**
   * Compare two strings in constant time
   * Prevents timing attacks
   * @param a - First string
   * @param b - Second string
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}

// ==========================================
// USAGE IN AUDIT LOG SERVICE
// apps/api/src/modules/admin/core/services/audit-log.service.ts
// ==========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/database/prisma.service';
import { CryptoUtil } from '@/common/utils/crypto.util'; // ✅ Import centralisé

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    action: string;
    actorId: string;
    targetId?: string;
    details?: object;
  }): Promise<void> {
    // ✅ Get previous hash
    const lastEntry = await this.prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { hash: true },
    });

    const previousHash = lastEntry?.hash || '0';

    // ✅ Create blockchain-style hash using CryptoUtil
    const hash = CryptoUtil.createAuditLogHash(
      {
        action: data.action,
        actorId: data.actorId,
        targetId: data.targetId,
        details: data.details,
        timestamp: new Date().toISOString(),
      },
      previousHash
    );

    // Save to database
    await this.prisma.auditLog.create({
      data: {
        ...data,
        hash,
        previousHash,
      },
    });
  }

  async verifyIntegrity(): Promise<boolean> {
    const entries = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const formattedEntries = entries.map((entry) => ({
      data: {
        action: entry.action,
        actorId: entry.actorId,
        targetId: entry.targetId,
        details: entry.details,
        timestamp: entry.createdAt.toISOString(),
      },
      hash: entry.hash,
      previousHash: entry.previousHash,
    }));

    // ✅ Verify chain using CryptoUtil
    return CryptoUtil.verifyAuditLogChain(formattedEntries);
  }
}

// ==========================================
// USAGE IN KYC SERVICE (Webhook Verification)
// apps/api/src/modules/admin/kyc/services/kyc.service.ts
// ==========================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from '@/common/utils/crypto.util'; // ✅ Import centralisé

@Injectable()
export class KycService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Verify Yoti webhook signature
   */
  async verifyWebhookSignature(payload: object, signature: string): Promise<boolean> {
    const secret = this.config.get('KYC_WEBHOOK_SECRET')!;

    // ✅ Use CryptoUtil for HMAC verification
    const isValid = CryptoUtil.verifyHmacSignature(payload, signature, secret);

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    return true;
  }

  /**
   * Handle Yoti webhook
   */
  async handleYotiWebhook(payload: any, signature: string): Promise<void> {
    // Verify signature first
    await this.verifyWebhookSignature(payload, signature);

    // Process webhook...
    console.log('Webhook verified and processed');
  }
}

// ==========================================
// USAGE IN SETTINGS SERVICE (API Key Generation)
// apps/api/src/modules/admin/core/services/settings.service.ts
// ==========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/database/prisma.service';
import { CryptoUtil } from '@/common/utils/crypto.util'; // ✅ Import centralisé

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateApiKey(name: string): Promise<string> {
    // ✅ Use CryptoUtil for API key generation
    const apiKey = CryptoUtil.generateApiKey('oliver_live');

    // ✅ Hash the API key before storing (never store plain text)
    const hashedKey = CryptoUtil.sha256(apiKey);

    await this.prisma.apiKey.create({
      data: {
        name,
        keyHash: hashedKey,
        lastUsed: null,
      },
    });

    // Return plain API key only once (user must save it)
    return apiKey;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    // ✅ Hash the provided key and compare with stored hash
    const hashedKey = CryptoUtil.sha256(apiKey);

    const storedKey = await this.prisma.apiKey.findFirst({
      where: { keyHash: hashedKey },
    });

    return !!storedKey;
  }
}

// ==========================================
// NOTES IMPORTANTES
// ==========================================

/*
✅ POURQUOI CENTRALISER CRYPTO:

1. SÉCURITÉ:
   - Une seule implémentation à auditer
   - Évite les erreurs de crypto (IV, salt, etc.)
   - Timing-safe comparisons partout

2. MAINTENABILITÉ:
   - Changer l'algorithme = 1 seul endroit
   - Tests unitaires centralisés
   - Documentation unique

3. COHÉRENCE:
   - Tous les hashs utilisent le même format
   - Audit logs toujours chaînés correctement
   - API keys toujours générées de la même façon

❌ NE JAMAIS:
- Créer des hashs manuellement dans les services
- Utiliser Math.random() pour crypto
- Stocker des clés API en clair
- Comparer des hashs avec === (timing attack)

✅ TOUJOURS:
- Importer CryptoUtil
- Utiliser les méthodes statiques
- Logger les erreurs de crypto
- Vérifier la longueur des clés

🔥 EXEMPLE D'UTILISATION:

// ❌ MAUVAIS (dans un service):
import * as crypto from 'crypto';
const hash = crypto.createHash('sha256').update(data).digest('hex');

// ✅ BON:
import { CryptoUtil } from '@/common/utils/crypto.util';
const hash = CryptoUtil.sha256(data);
*/