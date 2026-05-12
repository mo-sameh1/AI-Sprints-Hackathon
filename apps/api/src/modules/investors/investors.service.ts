import { Injectable } from '@nestjs/common';
import { InvestorProfile } from '@ai-sprints/shared-types';
import { notFoundError, validationError } from '../../common/http.types';
import { InvestorsRepository } from '../database/repositories/platform.repositories';
import { SaveInvestorPreferencesDto, toInvestorPreferences } from './dto/investor-preferences.dto';

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

  async savePreferences(payload: SaveInvestorPreferencesDto): Promise<{ status: string; investorId: string; profile: InvestorProfile }> {
    const investorId = String(payload['investorId'] ?? `inv-${Date.now()}`);
    const existing = await this.investorsRepository.findById(investorId);

    const prefs = toInvestorPreferences(payload, investorId);

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

  async getInvestorById(id: string) {
    const investor = await this.investorsRepository.findById(id);
    return investor ?? notFoundError('Investor', id);
  }

  async addToPortfolio(investorId: string, farmId: string) {
    if (!farmId) return validationError('farmId is required', { field: 'farmId' });
    const investor = await this.investorsRepository.addToPortfolio(investorId, farmId);
    return investor ?? notFoundError('Investor', investorId);
  }

  getAllInvestors(): Promise<InvestorProfile[]> {
    return this.investorsRepository.findAll();
  }
}
