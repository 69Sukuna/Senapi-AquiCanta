import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    let dbStatus = 'disconnected';
    let userCount = 0;

    try {
      // Simple count query to check DB connection
      userCount = await this.prisma.user.count();
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error_or_unreachable';
    }

    return {
      status: 'ok',
      service: 'Aqui Canta Bolivia API',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        totalUsers: userCount,
      },
    };
  }

  async getSummary() {
    const users = await this.prisma.user.findMany({
      take: 10,
      include: {
        artistProfile: {
          include: {
            songs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      users,
      message: 'Bienvenido a la API de Aqui Canta Bolivia',
    };
  }
}
