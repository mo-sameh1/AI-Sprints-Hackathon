import { Injectable } from '@nestjs/common';
import { InvestorProfile, InvestorPreferences } from '@ai-sprints/shared-types';

// ── In-memory store ───────────────────────────────────────────────────────────
const investorStore = new Map<string, InvestorProfile>();

// Seed demo investor
investorStore.set('inv-001', {
  id: 'inv-001',
  userId: 'user-001',
  name: 'Ahmed Mansour',
  preferences: {
    investorId: 'inv-001',
    riskTolerance: 'medium',
    investmentHorizonMonths: 12,
    capitalBudgetUsd: 100000,
    liquidityPreference: 'medium',
    preferredCrops: ['wheat', 'citrus', 'tomato'],
    preferredRegions: ['Delta', 'Fayoum'],
    expectedRoiPercent: 15,
    sustainabilityFocus: true,
  },
  portfolio: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

@Injectable()
export class InvestorsService {
  getPreferenceTemplate() {
    return {
      persona: 'investor',
      fields: [
        { name: 'riskTolerance', type: 'enum', options: ['low', 'medium', 'high'] },
        { name: 'investmentHorizonMonths', type: 'number', min: 3, max: 60 },
        { name: 'capitalBudgetUsd', type: 'number', min: 5000 },
        { name: 'liquidityPreference', type: 'enum', options: ['low', 'medium', 'high'] },
        { name: 'preferredCrops', type: 'string[]', suggestions: ['wheat', 'corn', 'rice', 'cotton', 'citrus', 'mango', 'olive', 'tomato', 'sugarcane'] },
        { name: 'preferredRegions', type: 'string[]', suggestions: ['Delta', 'Upper Egypt', 'Fayoum', 'Sinai', 'Canal Zone'] },
        { name: 'expectedRoiPercent', type: 'number', min: 5, max: 40 },
        { name: 'sustainabilityFocus', type: 'boolean' },
      ],
    };
  }

  savePreferences(payload: Record<string, unknown>): { status: string; investorId: string; profile: InvestorProfile } {
    const investorId = String(payload['investorId'] ?? `inv-${Date.now()}`);
    const existing = investorStore.get(investorId);

    const prefs: InvestorPreferences = {
      investorId,
      riskTolerance: (payload['riskTolerance'] as InvestorPreferences['riskTolerance']) ?? 'medium',
      investmentHorizonMonths: Number(payload['investmentHorizonMonths'] ?? 12),
      capitalBudgetUsd: Number(payload['capitalBudgetUsd'] ?? 50000),
      liquidityPreference: (payload['liquidityPreference'] as InvestorPreferences['liquidityPreference']) ?? 'medium',
      preferredCrops: (payload['preferredCrops'] as string[]) ?? [],
      preferredRegions: (payload['preferredRegions'] as string[]) ?? [],
      expectedRoiPercent: Number(payload['expectedRoiPercent'] ?? 15),
      sustainabilityFocus: Boolean(payload['sustainabilityFocus'] ?? false),
    };

    const profile: InvestorProfile = {
      id: investorId,
      userId: String(payload['userId'] ?? investorId),
      name: String(payload['name'] ?? 'Investor'),
      preferences: prefs,
      portfolio: existing?.portfolio ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    investorStore.set(investorId, profile);
    return { status: 'saved', investorId, profile };
  }

  getInvestorById(id: string): InvestorProfile | { error: string } {
    return investorStore.get(id) ?? { error: `Investor ${id} not found` };
  }

  addToPortfolio(investorId: string, farmId: string): InvestorProfile | { error: string } {
    const investor = investorStore.get(investorId);
    if (!investor) return { error: `Investor ${investorId} not found` };
    if (!investor.portfolio.includes(farmId)) {
      investor.portfolio.push(farmId);
      investor.updatedAt = new Date().toISOString();
      investorStore.set(investorId, investor);
    }
    return investor;
  }

  getAllInvestors(): InvestorProfile[] {
    return Array.from(investorStore.values());
  }
}
