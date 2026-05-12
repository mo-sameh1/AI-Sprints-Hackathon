import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
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
}
