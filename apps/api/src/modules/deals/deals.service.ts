import { Injectable } from '@nestjs/common';
import { DealRecommendation, FarmProfile, InvestorPreferences } from '@ai-sprints/shared-types';
import { recommendDealStructure } from '@ai-sprints/ai-worker';
import { notFoundError } from '../../common/http.types';
import { DealsRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class DealsService {
  constructor(private readonly dealsRepository: DealsRepository) {}

  recommendStructure(
    farm: FarmProfile,
    preferences: InvestorPreferences
  ): Promise<DealRecommendation> {
    const deal = recommendDealStructure(farm, preferences);
    return this.dealsRepository.save(deal);
  }

  async getDealById(id: string) {
    const deal = await this.dealsRepository.findById(id);
    return deal ?? notFoundError('Deal', id);
  }

  getDealsForInvestor(investorId: string): Promise<DealRecommendation[]> {
    return this.dealsRepository.findForInvestor(investorId);
  }

  getDealsForFarm(farmId: string): Promise<DealRecommendation[]> {
    return this.dealsRepository.findForFarm(farmId);
  }
}
