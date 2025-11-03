// apps/api/src/modules/integrations/storage/s3.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.S3_BUCKET || 'oliver-storage';
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });

      await this.client.send(command);
      const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;

      this.logger.log(`File uploaded to S3: ${key}`);
      return url;
    } catch (error) {
      this.logger.error('S3 upload failed', error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 300): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error('Failed to generate signed URL', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error('S3 delete failed', error);
      throw error;
    }
  }
}
