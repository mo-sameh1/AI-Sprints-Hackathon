import { Injectable } from '@nestjs/common';
import { FarmProfile } from '@ai-sprints/shared-types';
import { buildFarmProfile } from '@ai-sprints/ai-worker';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class FarmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminService: AdminService,
  ) {}

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
    const farm = await buildFarmProfile(raw, operatorId);
    
    // Ensure operator exists to satisfy foreign key constraint during demo
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

    const created = await this.prisma.farmProfile.create({
      data: {
        ...farm,
        yieldHistory: farm.yieldHistory as any,
      }
    });

    // Automatically register in Admin Review Queue
    try {
      const flags = [];
      if (created.requestedCapitalUsd > 150000) {
        flags.push({
          severity: 'medium',
          label: 'High Capital Request',
          detail: `$${created.requestedCapitalUsd.toLocaleString()} is above the standard threshold.`,
        });
      }
      const yieldHistory = created.yieldHistory as unknown[];
      if (!Array.isArray(yieldHistory) || yieldHistory.length === 0) {
        flags.push({
          severity: 'medium',
          label: 'No Yield History',
          detail: 'Operator has not submitted historical yield data yet.',
        });
      }
      if (created.imageUrls.length === 0 && created.documentUrls.length === 0) {
        flags.push({
          severity: 'low',
          label: 'No Evidence Uploaded',
          detail: 'No photos, documents, or voice notes were attached to this submission.',
        });
      }
      await this.adminService.createReviewItem(
        'farm_profile',
        created.id,
        created.aiProfileSummary || 'New farm profile submitted for review.',
        flags,
      );
    } catch (err) {
      console.warn('Failed to automatically create admin review item for new farm profile', err);
    }

    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      yieldHistory: created.yieldHistory as any
    } as FarmProfile;
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
