import { Injectable } from '@nestjs/common';
import { FarmProfile, MatchResult, InvestorPreferences } from '@ai-sprints/shared-types';
import { rankInvestmentMatches } from '@ai-sprints/ai-worker';
import { MatchesRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesRepository) {}

  async rankMatches(
    investorId: string,
    preferences: InvestorPreferences,
    farms: FarmProfile[]
  ): Promise<{ investorId: string; matches: MatchResult[]; rankedAt: string }> {
    const matches = rankInvestmentMatches(investorId, preferences, farms);
    const savedMatches = await this.matchesRepository.replaceForInvestor(investorId, matches);
    return {
      investorId,
      matches: savedMatches,
      rankedAt: new Date().toISOString(),
    };
  }

  async getMatchesForInvestor(investorId: string): Promise<MatchResult[] | { error: string }> {
    const matches = await this.matchesRepository.findForInvestor(investorId);
    return matches.length > 0 ? matches : { error: 'No matches found. Submit preferences first.' };
  }
}
