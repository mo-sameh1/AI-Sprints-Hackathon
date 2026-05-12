import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('submit')
  submitReport(@Body() payload: Record<string, unknown>) {
    return this.reportsService.submitReport(payload);
  }

  @Get('farm/:farmId')
  getReportsForFarm(@Param('farmId') farmId: string) {
    return this.reportsService.getReportsForFarm(farmId);
  }

  @Get('operator/:operatorId')
  getReportsForOperator(@Param('operatorId') operatorId: string) {
    return this.reportsService.getReportsForOperator(operatorId);
  }
}


