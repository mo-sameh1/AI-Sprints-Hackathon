import { Injectable } from '@nestjs/common';
import { AdminReviewItem, AuditLogEntry, ReviewStatus, ReviewItemType, RiskFlag } from '@ai-sprints/shared-types';
import { notFoundError } from '../../common/http.types';
import { AdminRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  getReviewQueue(status?: ReviewStatus): Promise<AdminReviewItem[]> {
    return this.adminRepository.findReviewQueue(status);
  }

  async getReviewItem(id: string) {
    const item = await this.adminRepository.findReviewItem(id);
    return item ?? notFoundError('Review item', id);
  }

  async createReviewItem(
    itemType: ReviewItemType,
    targetId: string,
    aiSummary: string,
    flags: RiskFlag[] = []
  ): Promise<AdminReviewItem> {
    const item: AdminReviewItem = {
      id: `review-${Date.now()}`,
      itemType,
      targetId,
      status: 'pending',
      aiSummary,
      flags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.adminRepository.saveReviewItem(item);
  }

  async reviewItem(
    id: string,
    action: 'approve' | 'reject' | 'override' | 'escalate',
    adminId: string,
    note?: string
  ) {
    const item = await this.adminRepository.findReviewItem(id);
    if (!item) return notFoundError('Review item', id);

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
    const saved = await this.adminRepository.saveReviewItem(updated);

    await this.adminRepository.saveAuditLog({
      id: `audit-${Date.now()}`,
      adminId,
      action,
      targetType: item.itemType,
      targetId: item.targetId,
      before,
      after: saved,
      timestamp: new Date().toISOString(),
    });

    return saved;
  }

  getAuditLog(): Promise<AuditLogEntry[]> {
    return this.adminRepository.findAuditLog();
  }

  async getStats(): Promise<Record<string, number>> {
    const items = await this.adminRepository.findReviewQueue();
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
