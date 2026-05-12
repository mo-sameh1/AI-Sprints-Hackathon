import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { AddToPortfolioDto, SaveInvestorPreferencesDto } from './dto/investor-preferences.dto';

@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Get('preferences-template')
  getPreferenceTemplate() {
    return this.investorsService.getPreferenceTemplate();
  }

  @Get()
  getAllInvestors() {
    return this.investorsService.getAllInvestors();
  }

  @Get(':id')
  getInvestor(@Param('id') id: string) {
    return this.investorsService.getInvestorById(id);
  }

  @Post('preferences')
  savePreferences(@Body() payload: SaveInvestorPreferencesDto) {
    return this.investorsService.savePreferences(payload);
  }

  @Post(':id/portfolio')
  addToPortfolio(@Param('id') id: string, @Body() body: AddToPortfolioDto) {
    return this.investorsService.addToPortfolio(id, body.farmId);
  }
}
