import { Injectable } from '@nestjs/common';
import { InvestorProfile, InvestorPreferences } from '@ai-sprints/shared-types';
import { InvestorsRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class InvestorsService {
  constructor(private readonly investorsRepository: InvestorsRepository) {}

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

  async savePreferences(payload: Record<string, unknown>): Promise<{ status: string; investorId: string; profile: InvestorProfile }> {
    const investorId = String(payload['investorId'] ?? `inv-${Date.now()}`);
    const existing = await this.investorsRepository.findById(investorId);

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

    const saved = await this.investorsRepository.save(profile);
    return { status: 'saved', investorId, profile: saved };
  }

  async getInvestorById(id: string): Promise<InvestorProfile | { error: string }> {
    const investor = await this.investorsRepository.findById(id);
    return investor ?? { error: `Investor ${id} not found` };
  }

  async addToPortfolio(investorId: string, farmId: string): Promise<InvestorProfile | { error: string }> {
    const investor = await this.investorsRepository.addToPortfolio(investorId, farmId);
    return investor ?? { error: `Investor ${investorId} not found` };
  }

  getAllInvestors(): Promise<InvestorProfile[]> {
    return this.investorsRepository.findAll();
  }
}
