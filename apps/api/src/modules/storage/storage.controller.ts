import type { Request, Response } from 'express';
import { Controller, Post, Get, Body, Param, UseGuards, Req, Res, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import { PlaybackService } from './playback.service';
import { SignedUrlGuard } from './guards/signed-url.guard';
import { SignedUrlDto } from './dto/signed-url.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('storage')
export class StorageController {
  private s3Client: S3Client;

  constructor(
    private storageService: StorageService,
    private playbackService: PlaybackService,
    private config: ConfigService,
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
  }

  @Post('signed-url')
  @UseGuards(JwtAuthGuard)
  async getSignedUrl(@Body() dto: SignedUrlDto, @Req() req: Request) {
    return this.storageService.getSignedUploadUrl(dto, req.user!.id);
  }

  @Post('complete')
  @UseGuards(JwtAuthGuard)
  async completeUpload(@Body() dto: CompleteUploadDto, @Req() req: Request) {
    return this.storageService.completeUpload(dto, req.user!.id);
  }

  @Post('playback')
  @UseGuards(JwtAuthGuard)
  async getPlaybackToken(@Body() body: { mediaId: string }, @Req() req: Request) {
    const ua = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    return this.playbackService.generatePlaybackToken(body.mediaId, req.user!.id, ua, ip);
  }

  @Get('playback/:token')
  @UseGuards(SignedUrlGuard)
  async streamMedia(@Param('token') token: string, @Req() req: Request, @Res() res: Response) {
    const { mediaId } = req.playbackPayload!;

    // Fetch media metadata
    const media = await prisma.media.findUnique({ where: { id: mediaId } });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Stream from S3
    const command = new GetObjectCommand({
      Bucket: this.config.get<string>('MINIO_BUCKET')!,
      Key: media.objectKey,
    });
    const response = await this.s3Client.send(command);

    // Security headers
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', media.contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream response
    (response.Body as any).pipe(res);
  }
}
