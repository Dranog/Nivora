// apps/api/src/modules/integrations/ai-moderation/ai-moderation.service.ts
import { Injectable, Logger, Optional } from '@nestjs/common';
import { GoogleVisionService } from './google-vision.service';
import { AwsRekognitionService } from './aws-rekognition.service';

export interface AIAnalysisResult {
  violence: number;
  adult: number;
  hate: number;
  spam: number;
}

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);

  constructor(
    @Optional() private readonly googleVision?: GoogleVisionService,
    @Optional() private readonly awsRekognition?: AwsRekognitionService,
  ) {
    if (!this.googleVision && !this.awsRekognition) {
      this.logger.warn('No AI moderation services configured. Analysis will return default values.');
    }
  }

  async analyzeContent(contentUrl: string): Promise<AIAnalysisResult> {
    try {
      this.logger.log(`Analyzing content: ${contentUrl}`);

      // Only call services that are available
      const promises: Promise<any>[] = [];
      
      if (this.googleVision) {
        promises.push(this.googleVision.analyze(contentUrl).catch(() => null));
      } else {
        promises.push(Promise.resolve(null));
      }

      if (this.awsRekognition) {
        promises.push(this.awsRekognition.analyze(contentUrl).catch(() => null));
      } else {
        promises.push(Promise.resolve(null));
      }

      const [googleResults, awsResults] = await Promise.all(promises);

      const result: AIAnalysisResult = {
        violence: this.average([googleResults?.violence, awsResults?.violence]),
        adult: this.average([googleResults?.adult, awsResults?.adult]),
        hate: googleResults?.hate || 0,
        spam: googleResults?.spam || 0,
      };

      this.logger.log(`Analysis complete: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('AI analysis failed', error);
      return { violence: 0, adult: 0, hate: 0, spam: 0 };
    }
  }

  private average(values: (number | undefined | null)[]): number {
    const validValues = values.filter((v) => v !== undefined && v !== null) as number[];
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length);
  }
}
