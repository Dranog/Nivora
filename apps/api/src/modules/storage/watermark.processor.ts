import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { WatermarkService } from './watermark.service';

const prisma = new PrismaClient();

@Processor('watermark')
export class WatermarkProcessor extends WorkerHost {
  constructor(
    private watermarkService: WatermarkService,
  ) {
    super();
  }

  async process(job: Job<{ mediaId: string }>) {
    const { mediaId } = job.data;

    // Récupérer Media
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { user: { include: { creatorProfile: true } } },
    });

    if (!media) throw new Error('Media not found');

    const metadata = {
      username: media.user.creatorProfile?.username || media.user.displayName || media.user.email.split('@')[0],
      mediaId: media.id,
      timestamp: new Date().toISOString().split('T')[0],
    };

    let processedKey: string;

    // Appliquer watermark selon type
    if (media.contentType.startsWith('image/')) {
      processedKey = await this.watermarkService.applyImageWatermark(media.objectKey, metadata);
    } else if (media.contentType.startsWith('video/')) {
      processedKey = await this.watermarkService.applyVideoWatermark(media.objectKey, metadata);
    } else {
      throw new Error('Unsupported content type');
    }

    // Update Media
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        status: 'READY',
        watermarked: true,
        objectKey: processedKey,
      },
    });
  }
}
