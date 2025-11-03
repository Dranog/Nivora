// apps/api/src/modules/admin/gateways/moderation.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
@WebSocketGateway({
  namespace: '/admin',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ModerationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ModerationGateway.name);
  private adminSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, permissions: true },
      });

      if (!user || user.role !== 'ADMIN') {
        client.disconnect();
        return;
      }

      client.data.userId = user.id;
      client.data.role = user.role;

      if (!this.adminSockets.has(user.id)) {
        this.adminSockets.set(user.id, new Set());
      }
      this.adminSockets.get(user.id).add(client.id);

      client.join('admins');
      
      if (user.permissions?.includes('reports.moderate')) {
        client.join('moderators');
      }

      this.logger.log(`Admin connected: ${user.id} (${client.id})`);

      client.emit('connection:success', {
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Connection authentication failed', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.adminSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.adminSockets.delete(userId);
        }
      }
      this.logger.log(`Admin disconnected: ${userId} (${client.id})`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  emitNewReport(reportId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', data: any) {
    this.logger.log(`Emitting new report: ${reportId} (${priority})`);
    
    this.server.to('admins').emit('admin:new-report', {
      reportId,
      priority,
      data,
      timestamp: new Date().toISOString(),
    });

    if (priority === 'CRITICAL' || priority === 'HIGH') {
      this.server.to('moderators').emit('admin:urgent-report', {
        reportId,
        priority,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitModerationDecision(decisionId: string, data: any) {
    this.logger.log(`Emitting moderation decision: ${decisionId}`);
    
    this.server.to('admins').emit('admin:moderation-decision', {
      decisionId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitKycUpdate(kycId: string, status: string, data: any) {
    this.logger.log(`Emitting KYC update: ${kycId} (${status})`);
    
    this.server.to('admins').emit('admin:kyc-update', {
      kycId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitExportComplete(exportId: string, userId: string, data: any) {
    const sockets = this.adminSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('admin:export-complete', {
          exportId,
          data,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  notifyDashboardUpdate(metrics: any) {
    this.server.to('admins').emit('admin:dashboard-update', {
      metrics,
      timestamp: new Date().toISOString(),
    });
  }
}
