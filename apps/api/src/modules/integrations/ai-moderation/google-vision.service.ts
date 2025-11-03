// apps/api/src/modules/integrations/ai-moderation/google-vision.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async analyze(imageUrl: string): Promise<{ violence: number; adult: number; hate: number; spam: number }> {
    try {
      const [result] = await this.client.safeSearchDetection(imageUrl);
      const detections = result.safeSearchAnnotation;

      if (!detections) {
        return { violence: 0, adult: 0, hate: 0, spam: 0 };
      }

      const scoreMap = {
        VERY_UNLIKELY: 0,
        UNLIKELY: 20,
        POSSIBLE: 50,
        LIKELY: 75,
        VERY_LIKELY: 95,
      };

      return {
        violence: scoreMap[(detections.violence || 'VERY_UNLIKELY') as keyof typeof scoreMap],
        adult: scoreMap[(detections.adult || 'VERY_UNLIKELY') as keyof typeof scoreMap],
        hate: scoreMap[(detections.racy || 'VERY_UNLIKELY') as keyof typeof scoreMap], // using 'racy' as proxy for hate
        spam: scoreMap[(detections.spoof || 'VERY_UNLIKELY') as keyof typeof scoreMap], // using 'spoof' as proxy for spam
      };
    } catch (error) {
      this.logger.error('Google Vision analysis failed', error);
      throw error;
    }
  }
}
