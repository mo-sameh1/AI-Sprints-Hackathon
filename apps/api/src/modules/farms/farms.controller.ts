import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { FarmsService } from './farms.service';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Get()
  getAllFarms() {
    return this.farmsService.getAllFarms();
  }

  @Get('active')
  getActiveFarms() {
    return this.farmsService.getActiveFarms();
  }

  @Get(':id')
  getFarm(@Param('id') id: string) {
    return this.farmsService.getFarmById(id);
  }

  @Post()
  createFarm(@Body() payload: Record<string, unknown>) {
    const operatorId = String(payload['operatorId'] ?? 'op-unknown');
    return this.farmsService.createFarm(payload, operatorId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.farmsService.updateFarmStatus(id, body.status as never);
  }
}
