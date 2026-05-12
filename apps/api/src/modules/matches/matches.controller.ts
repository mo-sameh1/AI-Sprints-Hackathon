import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { FarmsService } from '../farms/farms.service';
import { InvestorsService } from '../investors/investors.service';
import { InvestorProfile } from '@ai-sprints/shared-types';
import { RankMatchesDto, toRankingPreferences } from './dto/rank-matches.dto';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly farmsService: FarmsService,
    private readonly investorsService: InvestorsService,
  ) {}

  @Post('rank')
  async rankMatches(@Body() payload: RankMatchesDto) {
    const investorId = String(payload['investorId'] ?? 'inv-001');
    const investorResult = await this.investorsService.getInvestorById(investorId);
    const farms = await this.farmsService.getActiveFarms();

    if ('error' in investorResult) {
      const prefs = toRankingPreferences(payload, investorId);
      return this.matchesService.rankMatches(investorId, prefs, farms);
    }

    const investor = investorResult as InvestorProfile;
    const farmList = await this.farmsService.getAllFarms();
    return this.matchesService.rankMatches(investorId, investor.preferences, farmList);
  }

  @Get(':investorId')
  getMatchesForInvestor(@Param('investorId') investorId: string) {
    return this.matchesService.getMatchesForInvestor(investorId);
  }
}
