import { Injectable } from '@nestjs/common';
import { AdminReviewItem, AuditLogEntry, ReviewStatus, ReviewItemType, RiskFlag } from '@ai-sprints/shared-types';

const reviewStore = new Map<string, AdminReviewItem>();
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
seedItems.forEach(item => {
  reviewStore.set(item.id, item);
  itemCounter++;
});

@Injectable()
export class AdminService {
  getReviewQueue(status?: ReviewStatus): AdminReviewItem[] {
    const items = Array.from(reviewStore.values());
    if (status) return items.filter(i => i.status === status);
    return items.sort((a, b) => {
      const order = { pending: 0, escalated: 1, approved: 2, rejected: 3, overridden: 4 };
      return order[a.status] - order[b.status];
    });
  }

  getReviewItem(id: string): AdminReviewItem | { error: string } {
    return reviewStore.get(id) ?? { error: `Review item ${id} not found` };
  }

  createReviewItem(
    itemType: ReviewItemType,
    targetId: string,
    aiSummary: string,
    flags: RiskFlag[] = []
  ): AdminReviewItem {
    const id = `review-${String(itemCounter++).padStart(3, '0')}`;
    const item: AdminReviewItem = {
      id,
      itemType,
      targetId,
      status: 'pending',
      aiSummary,
      flags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reviewStore.set(id, item);
    return item;
  }

  reviewItem(
    id: string,
    action: 'approve' | 'reject' | 'override' | 'escalate',
    adminId: string,
    note?: string
  ): AdminReviewItem | { error: string } {
    const item = reviewStore.get(id);
    if (!item) return { error: `Review item ${id} not found` };

    const statusMap: Record<string, ReviewStatus> = {
      approve: 'approved',
      reject: 'rejected',
      override: 'overridden',
      escalate: 'escalated',
    };

    const before = { ...item };
    const updated: AdminReviewItem = {
      ...item,
      status: statusMap[action],
      reviewedBy: adminId,
      reviewNote: note,
      updatedAt: new Date().toISOString(),
    };
    reviewStore.set(id, updated);

    auditLog.push({
      id: `audit-${Date.now()}`,
      adminId,
      action,
      targetType: item.itemType,
      targetId: item.targetId,
      before,
      after: updated,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  getAuditLog(): AuditLogEntry[] {
    return [...auditLog].reverse();
  }

  getStats(): Record<string, number> {
    const items = Array.from(reviewStore.values());
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      escalated: items.filter(i => i.status === 'escalated').length,
      criticalFlags: items.filter(i => i.flags.some(f => f.severity === 'high')).length,
    };
  }
}
