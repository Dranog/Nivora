// apps/api/src/modules/integrations/ai-moderation/aws-rekognition.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';

@Injectable()
export class AwsRekognitionService {
  private readonly logger = new Logger(AwsRekognitionService.name);
  private client: RekognitionClient;

  constructor() {
    this.client = new RekognitionClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async analyze(imageUrl: string): Promise<{ violence: number; adult: number }> {
    try {
      const imageBytes = await this.downloadImage(imageUrl);

      const command = new DetectModerationLabelsCommand({
        Image: { Bytes: imageBytes },
        MinConfidence: 0,
      });

      const response = await this.client.send(command);
      const labels = response.ModerationLabels || [];

      let violenceScore = 0;
      let adultScore = 0;

      labels.forEach((label: any) => {
        const confidence = label.Confidence || 0;
        const category = label.ParentName || label.Name;

        if (category?.toLowerCase().includes('violence')) {
          violenceScore = Math.max(violenceScore, confidence);
        }
        if (category?.toLowerCase().includes('explicit') || category?.toLowerCase().includes('suggestive')) {
          adultScore = Math.max(adultScore, confidence);
        }
      });

      return {
        violence: Math.round(violenceScore),
        adult: Math.round(adultScore),
      };
    } catch (error) {
      this.logger.error('AWS Rekognition analysis failed', error);
      throw error;
    }
  }

  private async downloadImage(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
