import { DealRecommendation } from '@ai-sprints/shared-types';

export type RecommendDealDto = {
  farmId: string;
  investorId?: string;
};

export type RecommendDealResponseDto = DealRecommendation;
