import { Injectable } from '@nestjs/common';
import { DealRecommendation, FarmProfile, InvestorPreferences } from '@ai-sprints/shared-types';
import { recommendDealStructure } from '@ai-sprints/ai-worker';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendStructure(
    farm: FarmProfile,
    preferences: InvestorPreferences
  ): Promise<DealRecommendation> {
    const deal = recommendDealStructure(farm, preferences);
    
    await this.prisma.dealRecommendation.create({
      data: {
        id: deal.id,
        farmId: deal.farmId,
        investorId: deal.investorId,
        structureType: deal.structureType,
        recommendedInvestmentUsd: deal.recommendedInvestmentUsd,
        projectedRoiPercent: deal.projectedRoiPercent,
        durationMonths: deal.durationMonths,
        terms: deal.terms as any,
        rationale: deal.rationale,
        riskSummary: deal.riskSummary,
        aiConfidence: deal.aiConfidence,
        createdAt: new Date(deal.createdAt)
      }
    });

    return deal;
  }

  async getDealById(id: string): Promise<DealRecommendation | { error: string }> {
    const deal = await this.prisma.dealRecommendation.findUnique({
      where: { id }
    });
    
    if (!deal) {
      return { error: `Deal ${id} not found` };
    }
    
    return {
      ...deal,
      terms: deal.terms as any,
      createdAt: deal.createdAt.toISOString()
    } as DealRecommendation;
  }

  async getDealsForInvestor(investorId: string): Promise<DealRecommendation[]> {
    const deals = await this.prisma.dealRecommendation.findMany({
      where: { investorId }
    });
    
    return deals.map(deal => ({
      ...deal,
      terms: deal.terms as any,
      createdAt: deal.createdAt.toISOString()
    })) as DealRecommendation[];
  }

  async getDealsForFarm(farmId: string): Promise<DealRecommendation[]> {
    const deals = await this.prisma.dealRecommendation.findMany({
      where: { farmId }
    });
    
    return deals.map(deal => ({
      ...deal,
      terms: deal.terms as any,
      createdAt: deal.createdAt.toISOString()
    })) as DealRecommendation[];
  }
}
