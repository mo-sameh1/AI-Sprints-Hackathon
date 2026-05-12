import { Injectable } from '@nestjs/common';
import { DealRecommendation, FarmProfile, InvestorPreferences } from '@ai-sprints/shared-types';
import { recommendDealStructure } from '@ai-sprints/ai-worker';

const dealStore = new Map<string, DealRecommendation>();

@Injectable()
export class DealsService {
  recommendStructure(
    farm: FarmProfile,
    preferences: InvestorPreferences
  ): DealRecommendation {
    const deal = recommendDealStructure(farm, preferences);
    dealStore.set(deal.id, deal);
    return deal;
  }

  getDealById(id: string): DealRecommendation | { error: string } {
    return dealStore.get(id) ?? { error: `Deal ${id} not found` };
  }

  getDealsForInvestor(investorId: string): DealRecommendation[] {
    return Array.from(dealStore.values()).filter(d => d.investorId === investorId);
  }

  getDealsForFarm(farmId: string): DealRecommendation[] {
    return Array.from(dealStore.values()).filter(d => d.farmId === farmId);
  }
}
