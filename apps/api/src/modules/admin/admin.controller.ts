import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('queue')
  getReviewQueue(@Query('status') status?: string) {
    return this.adminService.getReviewQueue(status as never);
  }

  @Get('queue/:id')
  getReviewItem(@Param('id') id: string) {
    return this.adminService.getReviewItem(id);
  }

  @Post('queue/:id/review')
  reviewItem(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject' | 'override' | 'escalate'; adminId: string; note?: string }
  ) {
    return this.adminService.reviewItem(id, body.action, body.adminId, body.note);
  }

  @Get('audit')
  getAuditLog() {
    return this.adminService.getAuditLog();
  }
}
