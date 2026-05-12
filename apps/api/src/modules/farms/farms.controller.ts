import { Controller, Get, Param } from '@nestjs/common';
import { FarmsService } from './farms.service';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Get(':id')
  getFarm(@Param('id') id: string) {
    return this.farmsService.getFarmById(id);
  }
}

