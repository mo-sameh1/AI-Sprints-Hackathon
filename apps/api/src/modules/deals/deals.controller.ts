import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DealsService } from './deals.service';
import { FarmsService } from '../farms/farms.service';
import { InvestorsService } from '../investors/investors.service';
import { FarmProfile, InvestorProfile } from '@ai-sprints/shared-types';
import { RecommendDealDto } from './dto/recommend-deal.dto';

@Controller('deals')
export class DealsController {
  constructor(
    private readonly dealsService: DealsService,
    private readonly farmsService: FarmsService,
    private readonly investorsService: InvestorsService,
  ) {}

  @Post('recommend')
  async recommendStructure(@Body() payload: RecommendDealDto) {
    const farmId = String(payload['farmId'] ?? '');
    const investorId = String(payload['investorId'] ?? 'inv-001');

    const farmResult = await this.farmsService.getFarmById(farmId);
    const investorResult = await this.investorsService.getInvestorById(investorId);

    if ('error' in farmResult) return farmResult;
    if ('error' in investorResult) return investorResult;

    return this.dealsService.recommendStructure(
      farmResult as FarmProfile,
      (investorResult as InvestorProfile).preferences
    );
  }

  @Get('investor/:investorId')
  getDealsForInvestor(@Param('investorId') investorId: string) {
    return this.dealsService.getDealsForInvestor(investorId);
  }

  @Get('farm/:farmId')
  getDealsForFarm(@Param('farmId') farmId: string) {
    return this.dealsService.getDealsForFarm(farmId);
  }

  @Get(':id')
  getDeal(@Param('id') id: string) {
    return this.dealsService.getDealById(id);
  }
}
