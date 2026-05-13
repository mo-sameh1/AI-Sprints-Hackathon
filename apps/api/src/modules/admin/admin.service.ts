import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdminReviewItem, AuditLogEntry, ReviewStatus, ReviewItemType, RiskFlag } from '@ai-sprints/shared-types';
import { PrismaService } from '../prisma/prisma.service';

const auditLog: AuditLogEntry[] = [];
let itemCounter = 1;

// Seed with some demo review items
const seedItems: AdminReviewItem[] = [
  {
    id: 'review-001',
    itemType: 'farm_profile',
    targetId: 'farm-004',
    status: 'pending',
    aiSummary: 'New olive farm in North Sinai. No yield history. Mediterranean organic certification noted. Capital request of $200K is above average. Recommend verification of land title and water access permit.',
    flags: [
      { severity: 'medium', label: 'No Yield History', detail: 'Farm has not submitted any historical yield data.' },
      { severity: 'low', label: 'High Capital Request', detail: '$200K exceeds median for first-time operator farms.' },
    ],
    createdAt: '2025-05-05T11:00:00Z',
    updatedAt: '2025-05-05T11:00:00Z',
  },
  {
    id: 'review-002',
    itemType: 'deal_recommendation',
    targetId: 'deal-farm-002-inv-001',
    status: 'pending',
    aiSummary: 'Revenue share deal recommended for Upper Egypt Citrus Estate. $96K investment, 17.1% projected ROI. High AI confidence based on 1 year yield data and dual certifications.',
    flags: [
      { severity: 'low', label: 'Single Year History', detail: 'Only 1 year of yield data available — limited baseline.' },
    ],
    createdAt: '2025-05-10T14:00:00Z',
    updatedAt: '2025-05-10T14:00:00Z',
  },
  {
    id: 'review-003',
    itemType: 'alert',
    targetId: 'alert-1',
    status: 'pending',
    aiSummary: 'Critical weather alert for Delta region. Heavy rainfall projected — 95mm over 3 days. Affects 1 active farm. Operator notification via WhatsApp recommended.',
    flags: [
      { severity: 'high', label: 'Critical Weather Risk', detail: 'Rainfall exceeds 80mm threshold triggering flood risk protocols.' },
    ],
    createdAt: '2025-05-12T08:00:00Z',
    updatedAt: '2025-05-12T08:00:00Z',
  },
];

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.adminReviewItem.count();
    if (count === 0) {
      for (const item of seedItems) {
        await this.prisma.adminReviewItem.create({
          data: {
            ...item,
            flags: item.flags as any,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }
        });
        itemCounter++;
      }
    }
  }

  async getReviewQueue(status?: ReviewStatus): Promise<AdminReviewItem[]> {
    const where = status ? { status } : undefined;
    const items = await this.prisma.adminReviewItem.findMany({ where });
    
    return items.sort((a, b) => {
      const order: Record<string, number> = { pending: 0, escalated: 1, approved: 2, rejected: 3, overridden: 4 };
      return (order[a.status] ?? 99) - (order[b.status] ?? 99);
    }).map(i => ({
      ...i,
      flags: i.flags as any,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })) as AdminReviewItem[];
  }

  async getReviewItem(id: string): Promise<AdminReviewItem | { error: string }> {
    const item = await this.prisma.adminReviewItem.findUnique({ where: { id } });
    if (!item) return { error: `Review item ${id} not found` };
    
    return {
      ...item,
      flags: item.flags as any,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as AdminReviewItem;
  }

  async createReviewItem(
    itemType: ReviewItemType,
    targetId: string,
    aiSummary: string,
    flags: RiskFlag[] = []
  ): Promise<AdminReviewItem> {
    const id = `review-${String(itemCounter++).padStart(3, '0')}`;
    
    const item = await this.prisma.adminReviewItem.create({
      data: {
        id,
        itemType,
        targetId,
        status: 'pending',
        aiSummary,
        flags: flags as any,
      }
    });

    return {
      ...item,
      flags: item.flags as any,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as AdminReviewItem;
  }

  async reviewItem(
    id: string,
    action: 'approve' | 'reject' | 'override' | 'escalate',
    adminId: string,
    note?: string
  ): Promise<AdminReviewItem | { error: string }> {
    const before = await this.prisma.adminReviewItem.findUnique({ where: { id } });
    if (!before) return { error: `Review item ${id} not found` };

    const statusMap: Record<string, ReviewStatus> = {
      approve: 'approved',
      reject: 'rejected',
      override: 'overridden',
      escalate: 'escalated',
    };

    const updated = await this.prisma.adminReviewItem.update({
      where: { id },
      data: {
        status: statusMap[action],
        reviewedBy: adminId,
        reviewNote: note,
      }
    });

    // Synchronize review action back to the original FarmProfile
    if (before.itemType === 'farm_profile') {
      const farmStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'pending_review';
      try {
        await this.prisma.farmProfile.update({
          where: { id: before.targetId },
          data: { status: farmStatus }
        });
      } catch (err) {
        console.warn(`Failed to synchronize status back to FarmProfile ${before.targetId}`, err);
      }
    }

    const parsedUpdated = {
      ...updated,
      flags: updated.flags as any,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    } as AdminReviewItem;

    auditLog.push({
      id: `audit-${Date.now()}`,
      adminId,
      action,
      targetType: before.itemType as ReviewItemType,
      targetId: before.targetId,
      before: {
        ...before,
        flags: before.flags as any,
        createdAt: before.createdAt.toISOString(),
        updatedAt: before.updatedAt.toISOString(),
      } as AdminReviewItem,
      after: parsedUpdated,
      timestamp: new Date().toISOString(),
    });

    return parsedUpdated;
  }

  getAuditLog(): AuditLogEntry[] {
    return [...auditLog].reverse();
  }

  async getStats(): Promise<Record<string, number>> {
    const items = await this.prisma.adminReviewItem.findMany();
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      escalated: items.filter(i => i.status === 'escalated').length,
      criticalFlags: items.filter(i => (i.flags as any[]).some(f => f.severity === 'high')).length,
    };
  }
}
