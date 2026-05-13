import { Injectable, Logger } from '@nestjs/common';
import { FarmProfile } from '@ai-sprints/shared-types';
import { buildFarmProfile } from '@ai-sprints/ai-worker';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FarmsService {
  private readonly logger = new Logger(FarmsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getAllFarms(): Promise<FarmProfile[]> {
    const farms = await this.prisma.farmProfile.findMany();
    return farms.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      yieldHistory: f.yieldHistory as any
    })) as FarmProfile[];
  }

  async getFarmById(id: string): Promise<FarmProfile | { error: string }> {
    const farm = await this.prisma.farmProfile.findUnique({ where: { id } });
    if (!farm) return { error: `Farm ${id} not found` };
    return {
      ...farm,
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
      yieldHistory: farm.yieldHistory as any
    } as FarmProfile;
  }

  async getActiveFarms(): Promise<FarmProfile[]> {
    const farms = await this.prisma.farmProfile.findMany({ where: { status: 'active' } });
    return farms.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      yieldHistory: f.yieldHistory as any
    })) as FarmProfile[];
  }

  async createFarm(raw: Record<string, unknown>, operatorId: string): Promise<FarmProfile> {
    try {
      this.logger.log(`[createFarm] Step 1: building farm profile for operatorId=${operatorId}`);
      const farm = await buildFarmProfile(raw, operatorId);
      this.logger.log(`[createFarm] Step 1 OK: farmId=${farm.id} crop=${farm.currentCrop} capital=${farm.requestedCapitalUsd}`);

      // Ensure operator exists to satisfy foreign key constraint during demo
      this.logger.log(`[createFarm] Step 2: upserting user operatorId=${operatorId}`);
      await this.prisma.user.upsert({
        where: { id: operatorId },
        update: {},
        create: {
          id: operatorId,
          email: `${operatorId}@example.com`,
          name: 'Demo Operator',
          role: 'operator'
        }
      });
      this.logger.log(`[createFarm] Step 2 OK: user upserted`);

      this.logger.log(`[createFarm] Step 3: upserting operatorProfile`);
      await this.prisma.operatorProfile.upsert({
        where: { userId: operatorId },
        update: {},
        create: {
          id: operatorId,
          userId: operatorId,
          name: 'Demo Operator',
          phone: '+1234567890',
          region: 'Egypt',
          verificationStatus: 'verified'
        }
      });
      this.logger.log(`[createFarm] Step 3 OK: operatorProfile upserted`);

      // Strip string timestamps — Prisma handles these via @default(now()) / @updatedAt
      const { createdAt: _ca, updatedAt: _ua, ...farmData } = farm;
      this.logger.log(`[createFarm] Step 4: creating farmProfile record`);
      this.logger.log(`[createFarm] farmData keys: ${Object.keys(farmData).join(', ')}`);
      const created = await this.prisma.farmProfile.create({
        data: {
          ...farmData,
          yieldHistory: farm.yieldHistory as any,
        }
      });
      this.logger.log(`[createFarm] Step 4 OK: farmProfile created id=${created.id}`);

      const result = {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        yieldHistory: created.yieldHistory as any
      } as FarmProfile;

      // Auto-create admin review item so farm appears in the review queue
      const flags: { severity: string; label: string; detail: string }[] = [];
      if ((farm.yieldHistory ?? []).length === 0)
        flags.push({ severity: 'medium', label: 'No Yield History', detail: 'Farm has not submitted any historical yield data.' });
      if (farm.requestedCapitalUsd > 150000)
        flags.push({ severity: 'low', label: 'High Capital Request', detail: `$${farm.requestedCapitalUsd.toLocaleString()} exceeds median for first-time operator farms.` });

      this.logger.log(`[createFarm] Step 5: creating adminReviewItem id=review-${created.id} flags=${flags.length}`);
      await this.prisma.adminReviewItem.create({
        data: {
          id: `review-${created.id}`,
          itemType: 'farm_profile',
          targetId: created.id,
          status: 'pending',
          aiSummary: farm.aiProfileSummary ?? `New ${farm.currentCrop} farm submitted from ${farm.region}. Capital request: $${farm.requestedCapitalUsd.toLocaleString()}.`,
          flags: flags as any,
        }
      });
      this.logger.log(`[createFarm] Step 5 OK: adminReviewItem created`);

      this.logger.log(`[createFarm] DONE: farm=${created.id} operator=${operatorId}`);
      return result;
    } catch (err) {
      this.logger.error(`[createFarm] FAILED at some step: ${(err as Error).message}`, (err as Error).stack);
      throw err;
    }
  }

  async updateFarmStatus(id: string, status: string): Promise<FarmProfile | { error: string }> {
    try {
      const updated = await this.prisma.farmProfile.update({
        where: { id },
        data: { status }
      });
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        yieldHistory: updated.yieldHistory as any
      } as FarmProfile;
    } catch {
      return { error: `Farm ${id} not found` };
    }
  }
}
