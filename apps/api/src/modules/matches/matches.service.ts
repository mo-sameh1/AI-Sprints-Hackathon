import { Injectable } from '@nestjs/common';
import { MatchResult, InvestorPreferences } from '@ai-sprints/shared-types';
import { rankInvestmentMatches } from '@ai-sprints/ai-worker';

// ── In-memory cache of match results ─────────────────────────────────────────
const matchCache = new Map<string, MatchResult[]>();

@Injectable()
export class MatchesService {
  rankMatches(
    investorId: string,
    preferences: InvestorPreferences,
    farms: ReturnType<typeof Array.prototype.map>
  ): { investorId: string; matches: MatchResult[]; rankedAt: string } {
    const matches = rankInvestmentMatches(investorId, preferences, farms as never);
    matchCache.set(investorId, matches);
    return {
      investorId,
      matches,
      rankedAt: new Date().toISOString(),
    };
  }

  getMatchesForInvestor(investorId: string): MatchResult[] | { error: string } {
    return matchCache.get(investorId) ?? { error: 'No matches found. Submit preferences first.' };
  }
}
