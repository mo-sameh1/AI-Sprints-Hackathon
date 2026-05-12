import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './modules/database/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ai-sprints-api',
      version: '0.1.0',
      modules: ['auth', 'investors', 'operators', 'farms', 'matches', 'deals', 'notifications', 'reports', 'admin'],
    };
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      dependencies: {
        postgres: 'ok',
      },
    };
  }
}
