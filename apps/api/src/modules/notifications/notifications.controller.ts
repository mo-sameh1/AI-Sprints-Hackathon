import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAllSignals() {
    return this.notificationsService.getAllSignals();
  }

  @Get('farm/:farmId')
  getSignalsForFarm(@Param('farmId') farmId: string) {
    return this.notificationsService.getSignalsForFarm(farmId);
  }

  @Get(':id')
  getSignal(@Param('id') id: string) {
    return this.notificationsService.getSignalById(id);
  }

  @Post('evaluate')
  async evaluateSignals(@Body() payload: Record<string, unknown>) {
    return this.notificationsService.evaluateSignals(payload as never);
  }
}
