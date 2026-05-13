import { Injectable } from '@nestjs/common';
import { MatchResult, InvestorPreferences } from '@ai-sprints/shared-types';
import { rankInvestmentMatches } from '@ai-sprints/ai-worker';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async rankMatches(
    investorId: string,
    preferences: InvestorPreferences,
    farms: ReturnType<typeof Array.prototype.map>
  ): Promise<{ investorId: string; matches: MatchResult[]; rankedAt: string }> {
    const matches = rankInvestmentMatches(investorId, preferences, farms as never);
    
    // Clear old matches for this investor
    await this.prisma.matchResult.deleteMany({
      where: { investorId }
    });

    // Save new matches
    if (matches.length > 0) {
      await this.prisma.matchResult.createMany({
        data: matches.map(match => ({
          id: `match-${randomUUID()}`,
          farmId: match.farmId,
          investorId: match.investorId,
          score: match.score,
          confidence: match.confidence,
          reasons: match.reasons as any,
          riskFlags: match.riskFlags as any,
          horizonFitMonths: match.horizonFitMonths,
          estimatedRoiPercent: match.estimatedRoiPercent,
          createdAt: new Date(match.createdAt)
        }))
      });
    }

    return {
      investorId,
      matches,
      rankedAt: new Date().toISOString(),
    };
  }

  async getMatchesForInvestor(investorId: string): Promise<MatchResult[] | { error: string }> {
    const matches = await this.prisma.matchResult.findMany({
      where: { investorId }
    });
    
    if (matches.length === 0) {
      return { error: 'No matches found. Submit preferences first.' };
    }
    
    return matches.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      reasons: m.reasons as any,
      riskFlags: m.riskFlags as any,
    })) as MatchResult[];
  }
}
