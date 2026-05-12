export type UserRole = 'investor' | 'operator' | 'admin';

export type InvestorPreferences = {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentHorizonMonths: number;
  capitalBudgetUsd: number;
  liquidityPreference: 'low' | 'medium' | 'high';
};

export type FarmProfile = {
  id: string;
  operatorId: string;
  country: string;
  region: string;
  areaHectares: number;
  currentCrop: string;
  requestedCapitalUsd: number;
};

export type MatchResult = {
  farmId: string;
  investorId: string;
  score: number;
  reasons: string[];
};

