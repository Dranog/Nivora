// path: apps/api/src/common/ai/aiModeration.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient, ModerationStatus, Prisma } from '@prisma/client';
import OpenAI from 'openai';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(10, 'OPENAI_API_KEY manquant ou invalide'),
});
const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
});

const inputSchema = z.object({
  userId: z.string().cuid().optional(),
  text: z.string().min(1).max(20_000).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});
type ModerationInput = z.infer<typeof inputSchema>;

export type ModerationDecision = 'APPROVE' | 'REJECT' | 'ESCALATE';

export interface ModerationResult {
  decision: ModerationDecision;
  status: ModerationStatus;
  categories: Record<string, number>;
  flagged: boolean;
  reason?: string;
  model: string;
}

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);
  private readonly openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  private readonly model = 'omni-moderation-latest';

  async moderate(input: ModerationInput): Promise<ModerationResult> {
    const data = inputSchema.parse(input);
    if (!data.text && (!data.imageUrls || data.imageUrls.length === 0)) {
      throw new Error('Entrée vide : fournir `text` ou `imageUrls`.');
    }

    try {
      const categories: Record<string, number> = {};
      let flagged = false;

      if (data.text) {
        const r = await this.openai.moderations.create({ model: this.model, input: data.text });
        const res = (r as any).results?.[0]; // types OpenAI v6 : results sur moderation
        if (res) {
          flagged = flagged || Boolean(res.flagged);
          for (const [k, v] of Object.entries(res.category_scores ?? {})) {
            categories[`text:${k}`] = typeof v === 'number' ? v : 0;
          }
        }
      }

      if (data.imageUrls && data.imageUrls.length) {
        const imageBias = flagged ? 0.2 : 0.05;
        categories['image:presence'] = imageBias;
        flagged = flagged || imageBias >= 0.2;
      }

      const maxScore = Object.values(categories).reduce((m, v) => Math.max(m, v), 0);
      let decision: ModerationDecision = 'APPROVE';
      let status: ModerationStatus = 'APPROVED';
      let reason: string | undefined;

      if (maxScore >= 0.8) {
        decision = 'REJECT'; status = 'REJECTED'; reason = 'Score de risque très élevé (≥ 0.8)';
      } else if (maxScore >= 0.5 || flagged) {
        decision = 'ESCALATE'; status = 'ESCALATED'; reason = 'Score de risque intermédiaire (≥ 0.5) ou flagged';
      }

      await prisma.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: data.userId ?? null,
          event: 'AI_MODERATION_DECISION',
          resource: 'content',
          meta: ({
            inputHash: this.hashForPrivacy(data.text ?? JSON.stringify(data.imageUrls ?? [])),
            categories,
            decision,
            status,
            model: this.model,
            meta: data.meta ?? {},
          }) as Prisma.InputJsonValue,
        },
      });

      return { decision, status, categories, flagged, reason, model: this.model };
    } catch (err) {
      this.logger.error('Erreur modération IA', err instanceof Error ? err.stack : String(err));
      await prisma.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: input.userId ?? null,
          event: 'AI_MODERATION_ERROR',
          resource: 'content',
          meta: ({ message: (err as Error).message }) as Prisma.InputJsonValue,
        },
      });
      throw err;
    }
  }

  private hashForPrivacy(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}
