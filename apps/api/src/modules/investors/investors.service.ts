import { Injectable } from '@nestjs/common';
import { InvestorProfile, InvestorPreferences } from '@ai-sprints/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestorsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findInvestorProfile(idOrUserId: string) {
    return this.prisma.investorProfile.findFirst({
      where: {
        OR: [
          { id: idOrUserId },
          { userId: idOrUserId },
        ],
      },
      include: { preferences: true },
    });
  }

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
    const requestedInvestorId = String(payload['investorId'] ?? `inv-${Date.now()}`);
    const userId = String(payload['userId'] ?? requestedInvestorId);
    const existingProfile = await this.findInvestorProfile(requestedInvestorId);
    const investorId = existingProfile?.id ?? requestedInvestorId;
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

    // Upsert User
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        email: String(payload['email'] ?? `${investorId}@example.com`),
        name: String(payload['name'] ?? 'Investor'),
        role: 'investor'
      },
      create: {
        id: userId,
        email: String(payload['email'] ?? `${investorId}@example.com`),
        name: String(payload['name'] ?? 'Investor'),
        role: 'investor'
      }
    });

    // Upsert InvestorProfile
    await this.prisma.investorProfile.upsert({
      where: { id: investorId },
      update: {
        name: String(payload['name'] ?? 'Investor'),
      },
      create: {
        id: investorId,
        userId,
        name: String(payload['name'] ?? 'Investor'),
        portfolio: [],
      },
    });

    await this.prisma.investorPreferences.upsert({
      where: { investorId },
      update: {
        riskTolerance: prefs.riskTolerance,
        investmentHorizonMonths: prefs.investmentHorizonMonths,
        capitalBudgetUsd: prefs.capitalBudgetUsd,
        liquidityPreference: prefs.liquidityPreference,
        preferredCrops: prefs.preferredCrops,
        preferredRegions: prefs.preferredRegions,
        expectedRoiPercent: prefs.expectedRoiPercent,
        sustainabilityFocus: prefs.sustainabilityFocus,
      },
      create: prefs,
    });

    const profile = await this.findInvestorProfile(investorId);

    return { status: 'saved', investorId, profile: profile as unknown as InvestorProfile };
  }

  async getInvestorById(id: string): Promise<InvestorProfile | { error: string }> {
    const investor = await this.findInvestorProfile(id);
    if (!investor) return { error: `Investor ${id} not found` };
    return investor as unknown as InvestorProfile;
  }

  async addToPortfolio(investorId: string, farmId: string): Promise<InvestorProfile | { error: string }> {
    const investor = await this.findInvestorProfile(investorId);
    if (!investor) return { error: `Investor ${investorId} not found` };
    
    if (!investor.portfolio.includes(farmId)) {
      const updated = await this.prisma.investorProfile.update({
        where: { id: investor.id },
        data: {
          portfolio: {
            push: farmId
          }
        },
        include: { preferences: true }
      });
      return updated as unknown as InvestorProfile;
    }
    return investor as unknown as InvestorProfile;
  }

  async getAllInvestors(): Promise<InvestorProfile[]> {
    const investors = await this.prisma.investorProfile.findMany({
      include: { preferences: true }
    });
    return investors as unknown as InvestorProfile[];
  }
}
