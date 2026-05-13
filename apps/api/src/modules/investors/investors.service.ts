import { Injectable } from '@nestjs/common';
import { InvestorProfile, InvestorPreferences } from '@ai-sprints/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestorsService {
  constructor(private readonly prisma: PrismaService) {}

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
      where: { id: String(payload['userId'] ?? investorId) },
      update: {},
      create: {
        id: String(payload['userId'] ?? investorId),
        email: `${investorId}@example.com`,
        name: String(payload['name'] ?? 'Investor'),
        role: 'investor'
      }
    });

    // Upsert InvestorProfile
    const profile = await this.prisma.investorProfile.upsert({
      where: { id: investorId },
      update: {
        name: String(payload['name'] ?? 'Investor'),
        preferences: {
          upsert: {
            create: prefs,
            update: prefs
          }
        }
      },
      create: {
        id: investorId,
        userId: String(payload['userId'] ?? investorId),
        name: String(payload['name'] ?? 'Investor'),
        portfolio: [],
        preferences: {
          create: prefs
        }
      },
      include: { preferences: true }
    });

    return { status: 'saved', investorId, profile: profile as unknown as InvestorProfile };
  }

  async getInvestorById(id: string): Promise<InvestorProfile | { error: string }> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { id },
      include: { preferences: true }
    });
    if (!investor) return { error: `Investor ${id} not found` };
    return investor as unknown as InvestorProfile;
  }

  async addToPortfolio(investorId: string, farmId: string): Promise<InvestorProfile | { error: string }> {
    const investor = await this.prisma.investorProfile.findUnique({ where: { id: investorId } });
    if (!investor) return { error: `Investor ${investorId} not found` };
    
    if (!investor.portfolio.includes(farmId)) {
      const updated = await this.prisma.investorProfile.update({
        where: { id: investorId },
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
