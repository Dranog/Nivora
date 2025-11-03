import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClient } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHash, randomUUID } from 'crypto';
import { SignedUrlDto } from './dto/signed-url.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';

const prisma = new PrismaClient();

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    private config: ConfigService,
    @InjectQueue('watermark') private watermarkQueue: Queue,
  ) {
    this.s3Client = new S3Client({
      endpoint: `http://${this.config.get<string>('MINIO_ENDPOINT')!}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('MINIO_ACCESS_KEY')!,
        secretAccessKey: this.config.get<string>('MINIO_SECRET_KEY')!,
      },
      forcePathStyle: true,
    });
    this.bucket = this.config.get<string>('MINIO_BUCKET')!;
  }

  async getSignedUploadUrl(dto: SignedUrlDto, userId: string) {
    // Validation content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(dto.contentType)) {
      throw new BadRequestException(`Content type ${dto.contentType} not allowed`);
    }

    // Validation taille
    const maxSize = dto.contentType.startsWith('image/')
      ? 15 * 1024 * 1024  // 15MB images
      : 500 * 1024 * 1024; // 500MB videos

    if (dto.contentLength > maxSize) {
      throw new BadRequestException(`File size exceeds limit`);
    }

    // Génération object key
    const ext = dto.contentType.split('/')[1];
    const now = new Date();
    const objectKey = dto.objectKey || `uploads/${userId}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${this.generateUUID()}.${ext}`;

    // Génération presigned URL (TTL 10min)
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: dto.contentType,
      ContentLength: dto.contentLength,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });

    return {
      url,
      objectKey,
      expiresIn: 600,
      headers: {
        'Content-Type': dto.contentType,
      },
    };
  }

  async completeUpload(dto: CompleteUploadDto, userId: string) {
    // Vérifier checksum (optionnel mais recommandé)
    // TODO: Fetch object from S3 and verify hash

    // Créer Media en DB (status PROCESSING)
    const media = await prisma.media.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        ownerId: userId,
        objectKey: dto.objectKey,
        contentType: dto.contentType || 'application/octet-stream',
        bytes: dto.contentLength || 0,
        hash: dto.checksum,
        status: 'PROCESSING',
        watermarked: false,
        purpose: (dto.purpose || 'POST') as any,
      },
    });

    // Ajouter job watermark à la queue
    await this.queueWatermarkJob(media.id);

    return {
      mediaId: media.id,
      status: 'PROCESSING',
    };
  }

  private async queueWatermarkJob(mediaId: string) {
    await this.watermarkQueue.add('watermark', { mediaId });
  }

  private generateUUID(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
      .substring(0, 16);
  }
}
