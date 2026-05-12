import { InvestorPreferences } from '@ai-sprints/shared-types';

export type SaveInvestorPreferencesDto = Partial<InvestorPreferences> & {
  investorId?: string;
  userId?: string;
  name?: string;
};

export type AddToPortfolioDto = {
  farmId: string;
};

export const toInvestorPreferences = (
  payload: SaveInvestorPreferencesDto,
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
