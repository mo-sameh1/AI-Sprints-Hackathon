import { Body, Controller, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('submit')
  submitReport(@Body() payload: Record<string, unknown>) {
    return this.reportsService.submitReport(payload);
  }
}

