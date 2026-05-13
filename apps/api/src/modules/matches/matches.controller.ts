import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { FarmsService } from '../farms/farms.service';
import { InvestorsService } from '../investors/investors.service';
import { FarmProfile, InvestorProfile } from '@ai-sprints/shared-types';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly farmsService: FarmsService,
    private readonly investorsService: InvestorsService,
  ) {}

  @Post('rank')
  async rankMatches(@Body() payload: Record<string, unknown>) {
    const investorId = String(payload['investorId'] ?? 'inv-001');
    const investorResult = await this.investorsService.getInvestorById(investorId);
    const farms = await this.farmsService.getActiveFarms();

    if ('error' in investorResult) {
      // fallback: use payload preferences directly
      const prefs = {
        investorId,
        riskTolerance: (payload['riskTolerance'] as never) ?? 'medium',
        investmentHorizonMonths: Number(payload['investmentHorizonMonths'] ?? 12),
        capitalBudgetUsd: Number(payload['capitalBudgetUsd'] ?? 50000),
        liquidityPreference: (payload['liquidityPreference'] as never) ?? 'medium',
        preferredCrops: (payload['preferredCrops'] as string[]) ?? [],
        preferredRegions: (payload['preferredRegions'] as string[]) ?? [],
        expectedRoiPercent: Number(payload['expectedRoiPercent'] ?? 15),
        sustainabilityFocus: Boolean(payload['sustainabilityFocus'] ?? false),
      };
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
