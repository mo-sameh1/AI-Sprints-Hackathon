import { Body, Controller, Get, Param, Post, Patch, Logger, InternalServerErrorException } from '@nestjs/common';
import { FarmsService } from './farms.service';

@Controller('farms')
export class FarmsController {
  private readonly logger = new Logger(FarmsController.name);

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
  async createFarm(@Body() payload: Record<string, unknown>) {
    const operatorId = String(payload['operatorId'] ?? 'op-unknown');
    this.logger.log(`Creating farm: operatorId=${operatorId} name=${payload['name']}`);
    try {
      const result = await this.farmsService.createFarm(payload, operatorId);
      this.logger.log(`Farm created: ${(result as any).id}`);
      return result;
    } catch (err) {
      this.logger.error(`Farm creation failed: ${(err as Error).message}`, (err as Error).stack);
      throw new InternalServerErrorException((err as Error).message);
    }
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.farmsService.updateFarmStatus(id, body.status as never);
  }
}
