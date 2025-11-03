import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class PlaybackService {
  private redis: Redis;

  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL') || 'redis://localhost:6380';
    this.redis = new Redis(redisUrl);
  }

  async generatePlaybackToken(
    mediaId: string,
    userId: string,
    ua: string,
    ip: string,
  ) {
    // Vérifier access (purchase ou subscription)
    const hasAccess = await this.checkAccess(mediaId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this media');
    }

    // Générer jti unique
    const jti = this.generateJti();

    // Hash UA et IP
    const uaHash = this.hashValue(ua);
    const ipHash = this.hashValue(this.normalizeIp(ip, parseInt(this.config.get<string>('PLAYBACK_IP_TOLERANCE') || '24')));

    // Créer JWT court (TTL 10min)
    const ttl = parseInt(this.config.get<string>('PLAYBACK_TOKEN_TTL') || '600');
    const token = this.jwt.sign(
      {
        userId,
        mediaId,
        uaHash,
        ipHash,
        jti,
      },
      { expiresIn: ttl },
    );

    // Stocker jti dans Redis (single-use)
    await this.redis.setex(`playback:${jti}`, ttl, '1');

    return {
      playUrl: `/api/storage/playback/${token}`,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      jti,
    };
  }

  async validatePlaybackToken(token: string, ua: string, ip: string) {
    let payload: any;

    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Check single-use (jti exists in Redis)
    const jtiExists = await this.redis.get(`playback:${payload.jti}`);
    if (!jtiExists) {
      throw new ForbiddenException('Token already used or expired');
    }

    // Check UA binding
    if (this.config.get<string>('PLAYBACK_BIND_UA') === 'true') {
      const currentUaHash = this.hashValue(ua);
      if (currentUaHash !== payload.uaHash) {
        throw new ForbiddenException('UA mismatch');
      }
    }

    // Check IP binding (avec tolérance /24 pour mobile)
    if (this.config.get<string>('PLAYBACK_BIND_IP') === 'true') {
      const tolerance = parseInt(this.config.get<string>('PLAYBACK_IP_TOLERANCE') || '24');
      const currentIpHash = this.hashValue(this.normalizeIp(ip, tolerance));
      const expectedIpHash = payload.ipHash;

      if (currentIpHash !== expectedIpHash) {
        throw new ForbiddenException('IP mismatch');
      }
    }

    // Marquer token comme utilisé (delete jti)
    await this.redis.del(`playback:${payload.jti}`);

    return payload;
  }

  private async checkAccess(mediaId: string, userId: string): Promise<boolean> {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { post: true },
    });

    if (!media || !media.post) return false;

    // Si gratuit
    if (!media.post.isPaid) return true;

    // Si owner
    if (media.post.creatorId === userId) return true;

    // Si acheté (Purchase)
    const purchase = await prisma.purchase.findFirst({
      where: {
        fanId: userId,
        postId: media.post.id,
        status: 'PAID',
      },
    });
    if (purchase) return true;

    // Si subscription active
    const subscription = await prisma.subscription.findFirst({
      where: {
        fanId: userId,
        creatorId: media.post.creatorId,
        status: 'ACTIVE',
      },
    });
    if (subscription) return true;

    return false;
  }

  private generateJti(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex');
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private normalizeIp(ip: string, tolerance: number): string {
    // Normaliser IP pour tolérance /24 (mobile)
    const parts = ip.split('.');
    if (tolerance === 24 && parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    return ip;
  }
}
