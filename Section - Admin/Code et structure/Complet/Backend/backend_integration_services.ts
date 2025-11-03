// apps/api/src/modules/backend-integration/services/integration.services.ts

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import vision from '@google-cloud/vision';
import * as sgMail from '@sendgrid/mail';
import { YotiClient, SessionSpecificationBuilder, RequestedDocumentAuthenticityCheckBuilder, RequestedLivenessCheckBuilder } from 'yoti';
import { createHash } from 'crypto';

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
    private readonly googleVision: GoogleVisionService,
    private readonly awsRekognition: AwsRekognitionService,
  ) {}

  async analyzeContent(contentUrl: string): Promise<AIAnalysisResult> {
    try {
      this.logger.log(`Analyzing content: ${contentUrl}`);

      const [googleResults, awsResults] = await Promise.all([
        this.googleVision.analyze(contentUrl).catch(() => null),
        this.awsRekognition.analyze(contentUrl).catch(() => null),
      ]);

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

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client: vision.ImageAnnotatorClient;

  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_VISION_KEY_PATH,
    });
  }

  async analyze(imageUrl: string): Promise<{ violence: number; adult: number; hate: number; spam: number }> {
    try {
      const [result] = await this.client.safeSearchDetection(imageUrl);
      const safeSearch = result.safeSearchAnnotation;

      const scores = {
        violence: this.likelihoodToScore(safeSearch?.violence),
        adult: this.likelihoodToScore(safeSearch?.adult),
        hate: this.likelihoodToScore(safeSearch?.violence),
        spam: this.likelihoodToScore(safeSearch?.spoof),
      };

      this.logger.log(`Google Vision analysis: ${JSON.stringify(scores)}`);
      return scores;
    } catch (error) {
      this.logger.error('Google Vision analysis failed', error);
      throw error;
    }
  }

  private likelihoodToScore(likelihood: string | undefined): number {
    const map: Record<string, number> = {
      VERY_UNLIKELY: 5,
      UNLIKELY: 20,
      POSSIBLE: 50,
      LIKELY: 75,
      VERY_LIKELY: 95,
    };
    return map[likelihood || ''] || 0;
  }
}

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

      labels.forEach((label) => {
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

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendSuspensionEmail(user: any, reason: string, until: Date | null): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'Account Suspension Notice',
        html: `
          <h2>Account Suspension Notice</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Your account has been suspended for the following reason:</p>
          <blockquote>${reason}</blockquote>
          ${until ? `<p>Your account will be automatically reinstated on ${until.toLocaleDateString()}.</p>` : '<p>This suspension is permanent unless you appeal.</p>'}
          <p>If you believe this is a mistake, please contact our support team.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Suspension email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send suspension email', error);
    }
  }

  async sendPasswordResetEmail(user: any, tempPassword: string): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'Password Reset - Temporary Password',
        html: `
          <h2>Password Reset</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Your password has been reset by an administrator. Your temporary password is:</p>
          <h3 style="background: #f0f0f0; padding: 10px; font-family: monospace;">${tempPassword}</h3>
          <p><strong>Important:</strong> Please log in and change this password immediately.</p>
          <p>If you did not request this password reset, please contact support immediately.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }
  }

  async sendKycApprovalEmail(user: any): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'KYC Verification Approved',
        html: `
          <h2>KYC Verification Approved</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Congratulations! Your identity verification has been approved.</p>
          <p>You now have full access to all platform features.</p>
          <p>Thank you for completing the verification process.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`KYC approval email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send KYC approval email', error);
    }
  }

  async sendKycRejectionEmail(user: any, reason: string): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'no-reply@oliver.com',
        subject: 'KYC Verification - Action Required',
        html: `
          <h2>KYC Verification Update</h2>
          <p>Dear ${user.displayName || user.username},</p>
          <p>Unfortunately, we were unable to verify your identity at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please review the requirements and submit your documents again.</p>
          <p>If you have questions, please contact our support team.</p>
          <p>Best regards,<br>Oliver Team</p>
        `,
      };

      await sgMail.send(msg);
      this.logger.log(`KYC rejection email sent to ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to send KYC rejection email', error);
    }
  }
}

@Injectable()
export class YotiService {
  private readonly logger = new Logger(YotiService.name);
  private client: YotiClient;

  constructor() {
    this.client = new YotiClient(
      process.env.YOTI_CLIENT_SDK_ID!,
      process.env.YOTI_KEY_FILE_PATH!,
    );
  }

  async createSession(userId: string): Promise<string> {
    try {
      const sessionSpec = new SessionSpecificationBuilder()
        .withClientSessionTokenTtl(600)
        .withResourcesTtl(90000)
        .withUserTrackingId(userId)
        .withRequestedCheck(new RequestedDocumentAuthenticityCheckBuilder().build())
        .withRequestedCheck(new RequestedLivenessCheckBuilder().withMaxRetries(3).build())
        .build();

      const session = await this.client.createSession(sessionSpec);
      
      this.logger.log(`Yoti session created for user ${userId}`);
      return session.getSessionId();
    } catch (error) {
      this.logger.error('Failed to create Yoti session', error);
      throw error;
    }
  }

  async getSessionResults(sessionId: string): Promise<any> {
    try {
      const session = await this.client.getSession(sessionId);
      const checks = session.getChecks();

      const result = {
        identityMatch: this.extractScore(checks, 'ID_DOCUMENT_FACE_MATCH'),
        liveness: this.extractScore(checks, 'LIVENESS'),
        documentAuthenticity: this.extractScore(checks, 'ID_DOCUMENT_AUTHENTICITY'),
      };

      this.logger.log(`Yoti results retrieved: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to get Yoti session results', error);
      throw error;
    }
  }

  private extractScore(checks: any[], type: string): number {
    const check = checks.find((c) => c.getType() === type);
    if (!check) return 0;

    const report = check.getReport();
    const recommendation = report?.getRecommendation();
    
    if (recommendation?.getValue() === 'APPROVE') return 95;
    if (recommendation?.getValue() === 'REJECT') return 10;
    return 50;
  }
}

@Injectable()
export class AuditHashService {
  computeAuditHash(payload: any): string {
    const normalized = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash('sha256').update(normalized).digest('hex');
  }

  chainAuditHash(prevHash: string | null, currentHash: string): { hash: string; prevHash: string | null } {
    if (!prevHash) {
      return { hash: currentHash, prevHash: null };
    }

    const chainedInput = `${prevHash}:${currentHash}`;
    const chainedHash = createHash('sha256').update(chainedInput).digest('hex');

    return { hash: chainedHash, prevHash };
  }
}
