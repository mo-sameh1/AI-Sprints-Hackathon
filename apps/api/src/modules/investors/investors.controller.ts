import { Body, Controller, Get, Post } from '@nestjs/common';
import { InvestorsService } from './investors.service';

@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Get('preferences-template')
  getPreferenceTemplate() {
    return this.investorsService.getPreferenceTemplate();
  }

  @Post('preferences')
  savePreferences(@Body() payload: Record<string, unknown>) {
    return this.investorsService.savePreferences(payload);
  }
}

