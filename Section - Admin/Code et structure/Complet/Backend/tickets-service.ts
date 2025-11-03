// apps/api/src/modules/admin/support/services/tickets.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { EmailService } from '../../../integrations/email/email.service';

interface GetTicketsFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedToId?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

interface CreateTicketDto {
  userId: string;
  subject: string;
  category: string;
  priority?: string;
  message: string;
  source?: string;
}

interface UpdateTicketDto {
  status?: string;
  priority?: string;
  assignedToId?: string;
  tags?: string[];
}

interface CloseTicketDto {
  resolution: string;
}

interface AddTicketMessageDto {
  content: string;
  isInternal?: boolean;
  attachments?: string[];
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly email: EmailService,
  ) {}

  async findAll(filters: GetTicketsFilters) {
    const { status, priority, category, assignedToId, search, cursor, limit = 50 } = filters;

    const where: any = {};

    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;
    if (category && category !== 'ALL') where.category = category;
    if (assignedToId) where.assignedToId = assignedToId;
    
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    const hasMore = tickets.length > limit;
    const items = hasMore ? tickets.slice(0, -1) : tickets;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            displayName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        closedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async create(dto: CreateTicketDto, adminId?: string) {
    // Generate ticket number
    const ticketCount = await this.prisma.ticket.count();
    const ticketNumber = `#${String(ticketCount + 1).padStart(5, '0')}`;

    // Calculate SLA deadline based on priority
    const slaHours = this.getSLAHours(dto.priority || 'MEDIUM');
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        userId: dto.userId,
        subject: dto.subject,
        category: dto.category as any,
        priority: (dto.priority || 'MEDIUM') as any,
        status: 'OPEN',
        source: dto.source || 'in-app',
        slaDeadline,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create first message
    await this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: dto.userId,
        content: dto.message,
        isInternal: false,
      },
    });

    // Send confirmation email to user
    await this.email.sendTicketCreatedEmail(ticket.user, {
      ticketNumber,
      subject: dto.subject,
    });

    this.logger.log(`Ticket ${ticketNumber} created for user ${dto.userId}`);

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, adminId: string, request: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Update SLA deadline if priority changed
    let slaDeadline = ticket.slaDeadline;
    if (dto.priority && dto.priority !== ticket.priority) {
      const slaHours = this.getSLAHours(dto.priority);
      slaDeadline = new Date(ticket.createdAt.getTime() + slaHours * 60 * 60 * 1000);
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: dto.status as any,
        priority: dto.priority as any,
        assignedToId: dto.assignedToId,
        tags: dto.tags,
        slaDeadline,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'ticket.update',
      targetType: 'ticket',
      targetId: id,
      metadata: { changes: dto },
      request,
    });

    // Send notification if status changed
    if (dto.status && dto.status !== ticket.status) {
      await this.email.sendTicketStatusUpdateEmail(ticket.user, {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        newStatus: dto.status,
      });
    }

    this.logger.log(`Ticket ${id} updated by admin ${adminId}`);

    return updatedTicket;
  }

  async assign(id: string, adminId: string, request: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        assignedToId: adminId,
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        updatedAt: new Date(),
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'ticket.assign',
      targetType: 'ticket',
      targetId: id,
      metadata: { assignedToId: adminId },
      request,
    });

    this.logger.log(`Ticket ${id} assigned to admin ${adminId}`);

    return updatedTicket;
  }

  async close(id: string, dto: CloseTicketDto, adminId: string, request: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'CLOSED') {
      throw new BadRequestException('Ticket is already closed');
    }

    const closedTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedById: adminId,
        resolution: dto.resolution,
        updatedAt: new Date(),
      },
    });

    // Log action
    await this.auditLog.log({
      actorId: adminId,
      action: 'ticket.close',
      targetType: 'ticket',
      targetId: id,
      metadata: { resolution: dto.resolution },
      request,
    });

    // Send satisfaction survey email
    await this.email.sendTicketClosedEmail(ticket.user, {
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      resolution: dto.resolution,
      surveyLink: `${process.env.FRONTEND_URL}/tickets/${id}/survey`,
    });

    this.logger.log(`Ticket ${id} closed by admin ${adminId}`);

    return closedTicket;
  }

  async addMessage(id: string, dto: AddTicketMessageDto, senderId: string, request: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId,
        content: dto.content,
        isInternal: dto.isInternal || false,
        attachments: dto.attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Update ticket status if it was waiting for user
    if (ticket.status === 'WAITING_USER' && senderId === ticket.userId) {
      await this.prisma.ticket.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });
    }

    // Send email notification (only if not internal and sender is admin)
    if (!dto.isInternal && senderId !== ticket.userId) {
      await this.email.sendTicketReplyEmail(ticket.user, {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        message: dto.content,
        replyLink: `${process.env.FRONTEND_URL}/tickets/${id}`,
      });
    }

    this.logger.log(`Message added to ticket ${id} by ${senderId}`);

    return message;
  }

  async getStatistics() {
    const [
      open,
      inProgress,
      waitingUser,
      resolved,
      closed,
      overdueSLA,
    ] = await Promise.all([
      this.prisma.ticket.count({ where: { status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { status: 'WAITING_USER' } }),
      this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { status: 'CLOSED' } }),
      this.prisma.ticket.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_USER'] },
          slaDeadline: { lt: new Date() },
        },
      }),
    ]);

    // Calculate average resolution time
    const closedTickets = await this.prisma.ticket.findMany({
      where: {
        status: 'CLOSED',
        closedAt: { not: null },
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
      take: 100,
      orderBy: { closedAt: 'desc' },
    });

    const avgResolutionTime = closedTickets.length > 0
      ? closedTickets.reduce((sum, ticket) => {
          const diff = ticket.closedAt!.getTime() - ticket.createdAt.getTime();
          return sum + diff;
        }, 0) / closedTickets.length
      : 0;

    const avgResolutionHours = Math.round(avgResolutionTime / (1000 * 60 * 60));

    return {
      open,
      inProgress,
      waitingUser,
      resolved,
      closed,
      overdueSLA,
      avgResolutionHours,
      total: open + inProgress + waitingUser + resolved + closed,
    };
  }

  private getSLAHours(priority: string): number {
    const slaMap: Record<string, number> = {
      URGENT: 1,
      HIGH: 4,
      MEDIUM: 24,
      LOW: 72,
    };
    return slaMap[priority] || 24;
  }
}
