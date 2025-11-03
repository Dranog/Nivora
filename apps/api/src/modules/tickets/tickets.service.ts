import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class TicketsService {
  async create(userId: string, dto: CreateTicketDto) {
    const ticket = await prisma.ticket.create({
      data: {
        id: randomUUID(),
        userId,
        subject: dto.subject,
        message: dto.message || '',
        status: 'OPEN',
        priority: this.calculatePriority(dto.subject, dto.message),
        updatedAt: new Date(),
      },
    });

    // TODO: Notifier équipe support (email, Slack)
    // await this.notifySupport(ticket);

    return ticket;
  }

  async getUserTickets(
    userId: string,
    filters: { status?: string },
    pagination: { limit: number; offset: number },
  ) {
    const where: any = { userId };
    if (filters.status) {
      where.status = filters.status;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, total };
  }

  async getById(ticketId: string, userId: string, role: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: { select: { email: true } } },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check ownership (sauf admin/support)
    if (ticket.userId !== userId && !['ADMIN', 'SUPPORT'].includes(role)) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async resolve(ticketId: string, adminId: string, dto: UpdateTicketDto) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolution: dto.resolution,
      },
    });

    // Log
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        userId: adminId,
        event: 'TICKET_RESOLVED',
        resource: 'Ticket',
        meta: { ticketId },
      },
    });

    // TODO: Notifier user (email)

    return ticket;
  }

  async update(ticketId: string, adminId: string, dto: UpdateTicketDto) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: dto.status as any,
        priority: dto.priority as any,
        assignedTo: dto.assignedTo,
      },
    });

    return ticket;
  }

  private calculatePriority(subject: string, message: string): any {
    const text = `${subject} ${message}`.toLowerCase();

    // High priority keywords
    if (text.includes('payment') || text.includes('urgent') || text.includes('hack')) {
      return 'HIGH';
    }

    // Low priority keywords
    if (text.includes('question') || text.includes('how to')) {
      return 'LOW';
    }

    return 'MEDIUM';
  }
}
