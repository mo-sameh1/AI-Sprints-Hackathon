import { InvestorPreferences } from '@ai-sprints/shared-types';

export type RankMatchesDto = Partial<InvestorPreferences> & {
  investorId?: string;
};

export type RankMatchesResponseDto = {
  investorId: string;
  matches: import('@ai-sprints/shared-types').MatchResult[];
  rankedAt: string;
};

export const toRankingPreferences = (
  payload: RankMatchesDto,
  investorId: string
): InvestorPreferences => ({
  investorId,
  riskTolerance: payload.riskTolerance ?? 'medium',
  investmentHorizonMonths: Number(payload.investmentHorizonMonths ?? 12),
  capitalBudgetUsd: Number(payload.capitalBudgetUsd ?? 50000),
  liquidityPreference: payload.liquidityPreference ?? 'medium',
  preferredCrops: payload.preferredCrops ?? [],
  preferredRegions: payload.preferredRegions ?? [],
  expectedRoiPercent: Number(payload.expectedRoiPercent ?? 15),
  sustainabilityFocus: Boolean(payload.sustainabilityFocus ?? false),
});
