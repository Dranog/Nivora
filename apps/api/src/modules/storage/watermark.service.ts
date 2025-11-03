import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { createWriteStream, createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

@Injectable()
export class WatermarkService {
  private s3Client: S3Client;
  private bucket: string;
  private opacity: number;
  private moveInterval: number;

  constructor(private config: ConfigService) {
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
    this.opacity = parseFloat(this.config.get<string>('WATERMARK_OPACITY') || '0.18');
    this.moveInterval = parseInt(this.config.get<string>('WATERMARK_MOVE_INTERVAL') || '30');
  }

  async applyImageWatermark(
    objectKey: string,
    meta: { username: string; mediaId: string; timestamp: string },
  ): Promise<string> {
    // Download image from S3
    const inputPath = join(tmpdir(), `input-${meta.mediaId}.jpg`);
    const outputPath = join(tmpdir(), `output-${meta.mediaId}.jpg`);

    await this.downloadFromS3(objectKey, inputPath);

    // Generate watermark text
    const watermarkText = `@${meta.username} · #${meta.mediaId.substring(0, 8)} · ${meta.timestamp}`;

    // Apply watermark with Sharp
    const image = sharp(inputPath);
    const imageMetadata = await image.metadata();

    // Create SVG overlay
    const svgWatermark = Buffer.from(`
      <svg width="${imageMetadata.width}" height="${imageMetadata.height}">
        <style>
          .watermark {
            fill: white;
            font-size: 24px;
            font-family: Arial, sans-serif;
            opacity: ${this.opacity};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }
        </style>
        <text x="${imageMetadata.width - 20}" y="${imageMetadata.height - 20}"
              text-anchor="end" class="watermark">${watermarkText}</text>
      </svg>
    `);

    await image
      .composite([{ input: svgWatermark, gravity: 'southeast' }])
      .toFile(outputPath);

    // Upload processed image
    const processedKey = objectKey.replace('uploads/', 'processed/');
    await this.uploadToS3(outputPath, processedKey, 'image/jpeg');

    return processedKey;
  }

  async applyVideoWatermark(
    objectKey: string,
    meta: { username: string; mediaId: string; timestamp: string },
  ): Promise<string> {
    const inputPath = join(tmpdir(), `input-${meta.mediaId}.mp4`);
    const outputPath = join(tmpdir(), `output-${meta.mediaId}.mp4`);

    await this.downloadFromS3(objectKey, inputPath);

    const watermarkText = `@${meta.username} · #${meta.mediaId.substring(0, 8)}`;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters([
          {
            filter: 'drawtext',
            options: {
              text: watermarkText,
              fontsize: 24,
              fontcolor: 'white@0.8',
              x: '(w-text_w-20)',
              y: '(h-text_h-20)',
              shadowcolor: 'black@0.5',
              shadowx: 2,
              shadowy: 2,
            },
          },
          // Watermark itinérant (change position toutes les 30s)
          {
            filter: 'drawtext',
            options: {
              text: watermarkText,
              fontsize: 20,
              fontcolor: 'white@0.6',
              x: `if(lt(mod(t,${this.moveInterval * 2}),${this.moveInterval}),20,w-text_w-20)`,
              y: `if(lt(mod(t,${this.moveInterval * 2}),${this.moveInterval}),20,h-text_h-20)`,
            },
          },
        ])
        .output(outputPath)
        .on('end', async () => {
          const processedKey = objectKey.replace('uploads/', 'processed/');
          await this.uploadToS3(outputPath, processedKey, 'video/mp4');
          resolve(processedKey);
        })
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private async downloadFromS3(objectKey: string, destPath: string): Promise<void> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: objectKey });
    const response = await this.s3Client.send(command);
    const stream = response.Body as Readable;
    const writeStream = createWriteStream(destPath);

    return new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });
  }

  private async uploadToS3(filePath: string, objectKey: string, contentType: string): Promise<void> {
    const fileStream = createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      Body: fileStream,
      ContentType: contentType,
    });
    await this.s3Client.send(command);
  }
}
