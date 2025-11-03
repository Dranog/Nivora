import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class ReactionsService {
  async create(userId: string, dto: CreateReactionDto) {
    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Upsert reaction (si existe déjà, ne rien faire)
    const reaction = await prisma.reaction.upsert({
      where: {
        userId_postId_type: {
          userId,
          postId: dto.postId,
          type: dto.type as any,
        },
      },
      create: {
        id: randomUUID(),
        userId,
        postId: dto.postId,
        type: dto.type as any,
      },
      update: {},
    });

    return reaction;
  }

  async delete(reactionId: string, userId: string) {
    const reaction = await prisma.reaction.findUnique({
      where: { id: reactionId },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    if (reaction.userId !== userId) {
      throw new NotFoundException('Reaction not found');
    }

    await prisma.reaction.delete({
      where: { id: reactionId },
    });

    return { success: true };
  }

  async getByPost(postId: string) {
    // Grouper par type et compter
    const reactions = await prisma.reaction.groupBy({
      by: ['type'],
      where: { postId },
      _count: { type: true },
    });

    // Transformer en objet { LIKE: 12, FIRE: 5, HEART: 8 }
    const result: Record<string, number> = {};
    reactions.forEach(({ type, _count }) => {
      result[type] = _count.type;
    });

    return result;
  }

  async getUserReaction(userId: string, postId: string) {
    const reaction = await prisma.reaction.findFirst({
      where: { userId, postId },
    });

    return reaction?.type || null;
  }
}
