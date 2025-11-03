// path: apps/api/src/modules/admin/controllers/kyc.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { PrismaClient, KycLevel, KycStatus, UserRole as Role } from "@prisma/client";
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const updateSchema = z.object({
  level: z.nativeEnum(KycLevel),
  note: z.string().max(500).optional(),
});

const decisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(3).max(500).optional(),
});

@Controller("admin/kyc")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class KycController {
  @Get()
  async getAll(
    @Query("status") status?: KycStatus,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [submissions, total] = await Promise.all([
      prisma.kycVerification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatar: true,
              kycStatus: true,
              kycLevel: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              url: true,
              status: true,
              aiConfidence: true,
              aiAnalysis: true,
              uploadedAt: true,
            },
          },
        },
      }),
      prisma.kycVerification.count({ where }),
    ]);

    return {
      submissions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    const kyc = await prisma.kycVerification.findUnique({
      where: { id },
      // include: {
      //   user: {
      //     select: { id: true, email: true, username: true, displayName: true, avatar: true, kycStatus: true, kycLevel: true },
      //   },
      // }, // TEMPORARILY DISABLED - relation name mismatch
    });
    if (!kyc) {
      throw new Error("KYC introuvable");
    }
    return kyc;
  }

  @Patch(":id")
  async updateLevel(@Param("id") id: string, @Body() body: unknown) {
    const data = updateSchema.parse(body);
    const kyc = await prisma.kycVerification.update({
      where: { id },
      data: { level: data.level },
      // include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true, kycStatus: true, kycLevel: true } } }, // TEMPORARILY DISABLED
    });

    await prisma.auditLog.create({
      data: {
          id: crypto.randomUUID(),
        userId: kyc.userId,
        event: "KYC_LEVEL_UPDATED",
        resource: "kyc_verifications",
        meta: { kycId: kyc.id, level: data.level, note: data.note },
      },
    });

    return kyc;
  }

  @Post(":id/decision")
  @HttpCode(HttpStatus.OK)
  async decision(@Param("id") id: string, @Body() body: unknown) {
    const data = decisionSchema.parse(body);
    const existing = await prisma.kycVerification.findUnique({ where: { id } });
    if (!existing) throw new Error("KYC introuvable");

    const now = new Date();
    let status: KycStatus = existing.status;

    if (data.action === "APPROVE") {
      status = "VERIFIED";
    } else {
      status = "REJECTED";
    }

    const kyc = await prisma.kycVerification.update({
      where: { id },
      data: {
        status,
        approvedAt: data.action === "APPROVE" ? now : null,
        rejectedAt: data.action === "REJECT" ? now : null,
        rejectionReason: data.action === "REJECT" ? data.reason ?? "Rejected" : null,
        reviewedAt: now,
      },
      // include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true, kycStatus: true, kycLevel: true } } }, // TEMPORARILY DISABLED
    });

    await prisma.auditLog.create({
      data: {
          id: crypto.randomUUID(),
        userId: kyc.userId,
        event: "KYC_DECISION",
        resource: "kyc_verifications",
        meta: { kycId: kyc.id, action: data.action, reason: data.reason ?? null },
      },
    });

    // optionnel: synchroniser le statut utilisateur
    await prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: kyc.status, kycLevel: kyc.level || undefined },
    });

    return kyc;
  }
}
