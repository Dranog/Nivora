// ==========================================
// REPORTS DTOs & SERVICE & CONTROLLER
// ==========================================

// DTOs
export const GetReportsQuerySchema = z.object({
  status: z.enum(['ALL', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']).optional(),
  severity: z.enum(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.enum(['ALL', 'USER', 'POST', 'MESSAGE', 'COMMENT']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const UpdateReportSchema = z.object({
  status: z.enum(['DISMISSED', 'RESOLVED', 'ESCALATED']),
  action: z.enum(['WARN', 'BAN', 'DELETE_CONTENT']).optional(),
  notes: z.string().max(1000).optional(),
});

// Service
@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(query: GetReportsQueryDto) {
    const { status, severity, type, page, limit } = query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = status;
    if (severity && severity !== 'ALL') where.priority = severity;
    if (type && type !== 'ALL') where.targetType = type;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          reporter: { select: { username: true, avatar: true } },
          assignedTo: { select: { username: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { reports, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateReport(id: string, dto: UpdateReportDto, adminId: string, req: any) {
    const report = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedById: adminId,
        reviewedAt: new Date(),
        resolution: dto.notes,
      },
    });

    // Execute action if needed
    if (dto.action === 'BAN') {
      await this.banTargetUser(report.targetId);
    } else if (dto.action === 'DELETE_CONTENT') {
      await this.deleteContent(report.targetId, report.targetType);
    }

    await this.auditLog.log({
      actorId: adminId,
      action: 'report.update',
      targetType: 'report',
      targetId: id,
      metadata: dto,
      request: req,
    });

    return { success: true, report };
  }

  private async banTargetUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { suspendedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
  }

  private async deleteContent(contentId: string, type: string) {
    if (type === 'POST') {
      await this.prisma.post.update({
        where: { id: contentId },
        data: { deleted: true },
      });
    }
  }
}

// Controller
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  async getReports(@Query(new ZodValidationPipe(GetReportsQuerySchema)) query: GetReportsQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('reports.moderate')
  async updateReport(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateReportSchema)) dto: UpdateReportDto,
    @Req() req: any,
  ) {
    return this.reportsService.updateReport(id, dto, req.user.id, req);
  }

  @Post(':id/assign')
  async assignReport(@Param('id') id: string, @Body() dto: { moderatorId: string }) {
    const report = await this.prisma.report.update({
      where: { id },
      data: { assignedToId: dto.moderatorId },
    });
    return { success: true, report };
  }
}

// ==========================================
// MODERATION DTOs & SERVICE & CONTROLLER
// ==========================================

// DTOs
export const GetModerationQueueSchema = z.object({
  priority: z.enum(['ALL', 'LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'UNDER_REVIEW']).default('PENDING'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const ModerationDecisionSchema = z.object({
  contentId: z.string(),
  decision: z.enum(['APPROVE', 'REJECT', 'ESCALATE']),
  reason: z.string().min(10).max(500),
  actions: z.array(z.enum(['DELETE_CONTENT', 'WARN_USER', 'BAN_USER'])).optional(),
});

// Service
@Injectable()
export class ModerationService {
  constructor(
    private prisma: PrismaService,
    private aiModeration: AiModerationService,
    private auditLog: AuditLogService,
  ) {}

  async getQueue(query: GetModerationQueueDto) {
    const { priority, status, page, limit } = query;
    const where: any = { status };
    if (priority && priority !== 'ALL') where.priority = priority;

    const items = await this.prisma.report.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        reporter: { select: { username: true, avatar: true } },
      },
    });

    // Get AI analysis for each item
    const itemsWithAI = await Promise.all(
      items.map(async (item) => {
        const aiAnalysis = await this.getAIAnalysis(item.targetId, item.targetType);
        return { ...item, aiAnalysis };
      }),
    );

    return { items: itemsWithAI, total: items.length };
  }

  async makeDecision(dto: ModerationDecisionDto, moderatorId: string, req: any) {
    // Create moderation decision record
    await this.prisma.moderationDecision.create({
      data: {
        contentId: dto.contentId,
        contentType: 'POST',
        moderatorId,
        decision: dto.decision,
        reason: dto.reason,
      },
    });

    // Execute actions
    if (dto.decision === 'REJECT' && dto.actions) {
      for (const action of dto.actions) {
        if (action === 'DELETE_CONTENT') {
          await this.deleteContent(dto.contentId);
        } else if (action === 'BAN_USER') {
          await this.banContentOwner(dto.contentId);
        }
      }
    }

    // Update report status
    await this.prisma.report.updateMany({
      where: { targetId: dto.contentId },
      data: { status: dto.decision === 'APPROVE' ? 'RESOLVED' : 'DISMISSED' },
    });

    await this.auditLog.log({
      actorId: moderatorId,
      action: 'moderation.decision',
      targetType: 'content',
      targetId: dto.contentId,
      metadata: dto,
      request: req,
    });

    return { success: true };
  }

  private async getAIAnalysis(contentId: string, type: string) {
    // Get content URL
    const content = await this.getContentUrl(contentId, type);
    if (!content) return null;

    // Run AI analysis
    return this.aiModeration.analyzeContent(content);
  }

  private async getContentUrl(contentId: string, type: string): Promise<string | null> {
    if (type === 'POST') {
      const post = await this.prisma.post.findUnique({
        where: { id: contentId },
        select: { mediaUrls: true },
      });
      return post?.mediaUrls?.[0] || null;
    }
    return null;
  }

  private async deleteContent(contentId: string) {
    await this.prisma.post.update({
      where: { id: contentId },
      data: { deleted: true, deletedAt: new Date() },
    });
  }

  private async banContentOwner(contentId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: contentId },
      select: { authorId: true },
    });

    if (post) {
      await this.prisma.user.update({
        where: { id: post.authorId },
        data: {
          suspendedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          suspensionReason: 'Content violation',
        },
      });
    }
  }
}

// Controller
@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('queue')
  async getQueue(@Query(new ZodValidationPipe(GetModerationQueueSchema)) query: any) {
    return this.moderationService.getQueue(query);
  }

  @Post('decision')
  @UseGuards(PermissionsGuard)
  @RequirePermission('reports.moderate')
  async makeDecision(
    @Body(new ZodValidationPipe(ModerationDecisionSchema)) dto: ModerationDecisionDto,
    @Req() req: any,
  ) {
    return this.moderationService.makeDecision(dto, req.user.id, req);
  }
}

// ==========================================
// TRANSACTIONS DTOs & SERVICE & CONTROLLER
// ==========================================

// DTOs
export const GetTransactionsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.enum(['ALL', 'SUBSCRIPTION', 'PPV', 'TIP', 'PURCHASE', 'REFUND']).optional(),
  status: z.enum(['ALL', 'COMPLETED', 'PENDING', 'FAILED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// Service
@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetTransactionsQueryDto) {
    const { dateFrom, dateTo, type, status, page, limit } = query;
    const where: any = {};

    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    if (type && type !== 'ALL') where.type = type;
    if (status && status !== 'ALL') where.status = status;

    const [transactions, total, summary] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, avatar: true } },
        },
      }),
      this.prisma.payment.count({ where }),
      this.calculateSummary(where),
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary,
    };
  }

  async getTrends(period: string, metric: string) {
    const dateRange = this.getDateRange(period);
    const groupBy = period === '30d' ? 'day' : 'week';

    const data = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${groupBy}, created_at) as date,
        SUM(amount) as value
      FROM payments
      WHERE 
        status = 'SUCCESS'
        AND created_at >= ${dateRange.start}
        AND created_at <= ${dateRange.end}
      GROUP BY DATE_TRUNC(${groupBy}, created_at)
      ORDER BY date ASC
    `;

    return data;
  }

  async refund(transactionId: string, dto: any, adminId: string, req: any) {
    const transaction = await this.prisma.payment.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Create refund record
    await this.prisma.payment.create({
      data: {
        userId: transaction.userId,
        amount: -dto.amount,
        type: 'REFUND',
        status: 'SUCCESS',
        metadata: { originalTransactionId: transactionId, reason: dto.reason },
      },
    });

    await this.auditLog.log({
      actorId: adminId,
      action: 'transaction.refund',
      targetType: 'payment',
      targetId: transactionId,
      metadata: dto,
      request: req,
    });

    return { success: true };
  }

  private async calculateSummary(where: any) {
    const result = await this.prisma.payment.aggregate({
      where: { ...where, status: 'SUCCESS' },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    });

    return {
      totalRevenue: result._sum.amount || 0,
      totalPayouts: 0, // Calculate from payouts table
      avgTransaction: result._avg.amount || 0,
    };
  }

  private getDateRange(period: string) {
    const end = new Date();
    const start = new Date();
    if (period === '30d') start.setDate(start.getDate() - 30);
    else if (period === '3m') start.setMonth(start.getMonth() - 3);
    return { start, end };
  }
}

// Controller
@Controller('admin/transactions')
@UseGuards(JwtAuthGuard, AdminRoleGuard, RateLimitGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Query(new ZodValidationPipe(GetTransactionsQuerySchema)) query: any) {
    return this.transactionsService.findAll(query);
  }

  @Get('trends')
  async getTrends(@Query('period') period: string, @Query('metric') metric: string) {
    return this.transactionsService.getTrends(period, metric);
  }

  @Post(':id/refund')
  async refund(
    @Param('id') id: string,
    @Body() dto: { amount: number; reason: string },
    @Req() req: any,
  ) {
    return this.transactionsService.refund(id, dto, req.user.id, req);
  }
}