import { Body, Controller, Post } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post('recommend')
  recommendStructure(@Body() payload: Record<string, unknown>) {
    return this.dealsService.recommendStructure(payload);
  }
}

