import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OperatorsService } from './operators.service';

@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get()
  getAllOperators() {
    return this.operatorsService.getAllOperators();
  }

  @Get(':id')
  getOperator(@Param('id') id: string) {
    return this.operatorsService.getOperatorById(id);
  }

  @Post('register')
  registerOperator(@Body() payload: Record<string, unknown>) {
    return this.operatorsService.registerOperator(payload);
  }
}
