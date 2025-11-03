import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class GeoBlockingService {
  // Countries blocked by default (example: high-risk regions)
  private blockedCountries: Set<string> = new Set([
    // Add country codes as needed, e.g., 'KP', 'IR', 'SY'
  ]);

  // Countries allowed for admin access
  private adminAllowedCountries: Set<string> = new Set([
    'FR', 'US', 'GB', 'DE', 'ES', 'CA', // Add more as needed
  ]);

  constructor(private prisma: PrismaService) {}

  /**
   * Check if country is blocked for general access
   */
  isCountryBlocked(countryCode: string): boolean {
    return this.blockedCountries.has(countryCode.toUpperCase());
  }

  /**
   * Check if country is allowed for admin access
   */
  isCountryAllowedForAdmin(countryCode: string): boolean {
    // If no restrictions set, allow all
    if (this.adminAllowedCountries.size === 0) {
      return true;
    }
    return this.adminAllowedCountries.has(countryCode.toUpperCase());
  }

  /**
   * Get country from IP address (simplified - would use MaxMind GeoIP2 in production)
   */
  async getCountryFromIP(ipAddress: string): Promise<string | null> {
    // In production, integrate with MaxMind GeoIP2:
    // const reader = await maxmind.open('/path/to/GeoLite2-Country.mmdb');
    // const lookup = reader.get(ipAddress);
    // return lookup?.country?.iso_code || null;

    // For now, return null (no geo-blocking applied without GeoIP2 database)
    return null;
  }

  /**
   * Log geo-blocked access attempt
   */
  async logBlockedAccess(userId: string | null, ipAddress: string, country: string, endpoint: string) {
    await this.prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: userId || 'anonymous',
        event: 'GEO_BLOCKED',
        resource: 'Security',
        meta: {
          ipAddress,
          country,
          endpoint,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Add country to blocked list
   */
  addBlockedCountry(countryCode: string) {
    this.blockedCountries.add(countryCode.toUpperCase());
  }

  /**
   * Remove country from blocked list
   */
  removeBlockedCountry(countryCode: string) {
    this.blockedCountries.delete(countryCode.toUpperCase());
  }

  /**
   * Set admin allowed countries
   */
  setAdminAllowedCountries(countryCodes: string[]) {
    this.adminAllowedCountries = new Set(countryCodes.map(c => c.toUpperCase()));
  }
}
