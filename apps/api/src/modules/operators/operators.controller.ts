import { Body, Controller, Post } from '@nestjs/common';
import { OperatorsService } from './operators.service';

@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Post('profile-draft')
  createProfileDraft(@Body() payload: Record<string, unknown>) {
    return this.operatorsService.createProfileDraft(payload);
  }
}

