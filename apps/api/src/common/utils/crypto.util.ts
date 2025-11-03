// apps/api/src/common/utils/crypto.util.ts
// Centralized cryptographic utilities for the entire application

import * as bcrypt from 'bcrypt';
import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { randomUUID } from 'crypto';

export class CryptoUtil {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a SHA-256 hash of data
   */
  static sha256(data: string | object): string {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(stringData).digest('hex');
  }

  /**
   * Create an audit log hash (blockchain-style with previous hash)
   */
  static createAuditLogHash(data: object, previousHash: string = '0'): string {
    const normalized = JSON.stringify(data, Object.keys(data).sort());
    const combined = previousHash + normalized;
    return createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Verify integrity of audit log chain
   */
  static verifyAuditLogChain(entries: Array<{ data: any; hash: string; previousHash: string | null }>): boolean {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedHash = this.createAuditLogHash(entry.data, entry.previousHash || '0');

      if (entry.hash !== expectedHash) {
        return false;
      }

      if (i > 0 && entry.previousHash !== entries[i - 1].hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Create HMAC signature for webhooks
   */
  static createHmacSignature(payload: any, secret: string): string {
    const stringPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return createHmac('sha256', secret).update(stringPayload).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHmacSignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = this.createHmacSignature(payload, secret);
    return this.secureCompare(signature, expectedSignature);
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  static encrypt(text: string, key: string): string {
    const keyHash = createHash('sha256').update(key).digest();
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', keyHash, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedText: string, key: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const keyHash = createHash('sha256').update(key).digest();
    const decipher = createDecipheriv('aes-256-gcm', keyHash, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 32, encoding: BufferEncoding = 'hex'): string {
    const bytes = Math.ceil(length / 2);
    return randomBytes(bytes).toString(encoding).slice(0, length);
  }

  /**
   * Generate UUID v4
   */
  static generateUuid(): string {
    return randomUUID();
  }

  /**
   * Generate API key with prefix
   */
  static generateApiKey(prefix: string = 'oliver_live'): string {
    const randomPart = this.randomString(48, 'base64url');
    return `${prefix}_${randomPart}`;
  }

  /**
   * Timing-safe string comparison
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }

    return result === 0;
  }
}
