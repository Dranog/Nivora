// apps/api/src/modules/integrations/kyc-provider/yoti.service.ts

import { Injectable, Logger } from '@nestjs/common';
// @ts-expect-error - yoti module not installed, install with: pnpm add yoti
import { YotiClient, SessionSpecificationBuilder, RequestedDocumentAuthenticityCheckBuilder, RequestedLivenessCheckBuilder } from 'yoti';

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
