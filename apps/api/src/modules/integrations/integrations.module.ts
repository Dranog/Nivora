// apps/api/src/modules/integrations/integrations.module.ts
import { Module } from '@nestjs/common';
import { AiModerationService } from './ai-moderation/ai-moderation.service';
// import { GoogleVisionService } from './ai-moderation/google-vision.service';
// import { AwsRekognitionService } from './ai-moderation/aws-rekognition.service';
import { S3Service } from './storage/s3.service';
// import { EmailService } from './email/email.service';
// import { YotiService } from './kyc-provider/yoti.service';

@Module({
  providers: [
    // AI Moderation
    AiModerationService,
    // GoogleVisionService,  // Nécessite GOOGLE_APPLICATION_CREDENTIALS
    // AwsRekognitionService, // Nécessite AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
    
    // Storage
    S3Service,
    
    // Email
    // EmailService, // Nécessite SENDGRID_API_KEY
    
    // KYC Provider
    // YotiService, // Nécessite YOTI_CLIENT_SDK_ID + YOTI_KEY_FILE_PATH
  ],
  exports: [
    AiModerationService,
    // GoogleVisionService,
    // AwsRekognitionService,
    S3Service,
    // EmailService,
    // YotiService,
  ],
})
export class IntegrationsModule {}
