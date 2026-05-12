import { Injectable } from '@nestjs/common';
import {
  AdminReviewItem,
  AuditLogEntry,
  DealRecommendation,
  FarmProfile,
  InvestorProfile,
  MatchResult,
  NotificationSignal,
  OperatorProfile,
  OperatorReport,
} from '@ai-sprints/shared-types';
import {
  adminReviewItemData,
  dealRecommendationData,
  farmProfileData,
  investorProfileData,
  matchResultData,
  notificationSignalData,
  operatorProfileData,
  operatorReportData,
  toAdminReviewItem,
  toAuditLogEntry,
  toDealRecommendation,
  toFarmProfile,
  toInvestorProfile,
  toMatchResult,
  toNotificationSignal,
  toOperatorProfile,
  toOperatorReport,
} from '../database.mappers';
import { PrismaService } from '../prisma.service';

export interface FarmsRepositoryContract {
  findAll(): Promise<FarmProfile[]>;
  findActive(): Promise<FarmProfile[]>;
  findById(id: string): Promise<FarmProfile | null>;
  save(farm: FarmProfile): Promise<FarmProfile>;
  updateStatus(id: string, status: FarmProfile['status']): Promise<FarmProfile | null>;
}

export interface InvestorsRepositoryContract {
  findAll(): Promise<InvestorProfile[]>;
  findById(id: string): Promise<InvestorProfile | null>;
  save(investor: InvestorProfile): Promise<InvestorProfile>;
  addToPortfolio(investorId: string, farmId: string): Promise<InvestorProfile | null>;
}

export interface OperatorsRepositoryContract {
  findAll(): Promise<OperatorProfile[]>;
  findById(id: string): Promise<OperatorProfile | null>;
  save(operator: OperatorProfile): Promise<OperatorProfile>;
}

export interface MatchesRepositoryContract {
  replaceForInvestor(investorId: string, matches: MatchResult[]): Promise<MatchResult[]>;
  findForInvestor(investorId: string): Promise<MatchResult[]>;
}

export interface DealsRepositoryContract {
  save(deal: DealRecommendation): Promise<DealRecommendation>;
  findById(id: string): Promise<DealRecommendation | null>;
  findForInvestor(investorId: string): Promise<DealRecommendation[]>;
  findForFarm(farmId: string): Promise<DealRecommendation[]>;
}

export interface NotificationsRepositoryContract {
  saveMany(signals: NotificationSignal[]): Promise<NotificationSignal[]>;
  findAll(): Promise<NotificationSignal[]>;
  findById(id: string): Promise<NotificationSignal | null>;
  findForFarm(farmId: string): Promise<NotificationSignal[]>;
}

export interface ReportsRepositoryContract {
  save(report: OperatorReport): Promise<OperatorReport>;
  findForFarm(farmId: string): Promise<OperatorReport[]>;
  findForOperator(operatorId: string): Promise<OperatorReport[]>;
}

export interface AdminRepositoryContract {
  findReviewQueue(status?: AdminReviewItem['status']): Promise<AdminReviewItem[]>;
  findReviewItem(id: string): Promise<AdminReviewItem | null>;
  saveReviewItem(item: AdminReviewItem): Promise<AdminReviewItem>;
  saveAuditLog(entry: AuditLogEntry): Promise<AuditLogEntry>;
  findAuditLog(): Promise<AuditLogEntry[]>;
}

@Injectable()
export class FarmsRepository implements FarmsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<FarmProfile[]> {
    const rows = await this.prisma.farmProfile.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toFarmProfile);
  }

  async findActive(): Promise<FarmProfile[]> {
    const rows = await this.prisma.farmProfile.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toFarmProfile);
  }

  async findById(id: string): Promise<FarmProfile | null> {
    const row = await this.prisma.farmProfile.findUnique({ where: { id } });
    return row ? toFarmProfile(row) : null;
  }

  async save(farm: FarmProfile): Promise<FarmProfile> {
    const data = farmProfileData(farm);
    const row = await this.prisma.farmProfile.upsert({
      where: { id: farm.id },
      create: data,
      update: data,
    });
    return toFarmProfile(row);
  }

  async updateStatus(id: string, status: FarmProfile['status']): Promise<FarmProfile | null> {
    const existing = await this.prisma.farmProfile.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await this.prisma.farmProfile.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return toFarmProfile(row);
  }
}

@Injectable()
export class InvestorsRepository implements InvestorsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<InvestorProfile[]> {
    const rows = await this.prisma.investorProfile.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toInvestorProfile);
  }

  async findById(id: string): Promise<InvestorProfile | null> {
    const row = await this.prisma.investorProfile.findUnique({ where: { id } });
    return row ? toInvestorProfile(row) : null;
  }

  async save(investor: InvestorProfile): Promise<InvestorProfile> {
    const data = investorProfileData(investor);
    const row = await this.prisma.investorProfile.upsert({
      where: { id: investor.id },
      create: data,
      update: data,
    });
    return toInvestorProfile(row);
  }

  async addToPortfolio(investorId: string, farmId: string): Promise<InvestorProfile | null> {
    const investor = await this.findById(investorId);
    if (!investor) return null;

    const portfolio = investor.portfolio.includes(farmId)
      ? investor.portfolio
      : [...investor.portfolio, farmId];
    const row = await this.prisma.investorProfile.update({
      where: { id: investorId },
      data: { portfolio, updatedAt: new Date() },
    });
    return toInvestorProfile(row);
  }
}

@Injectable()
export class OperatorsRepository implements OperatorsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<OperatorProfile[]> {
    const rows = await this.prisma.operatorProfile.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toOperatorProfile);
  }

  async findById(id: string): Promise<OperatorProfile | null> {
    const row = await this.prisma.operatorProfile.findUnique({ where: { id } });
    return row ? toOperatorProfile(row) : null;
  }

  async save(operator: OperatorProfile): Promise<OperatorProfile> {
    const data = operatorProfileData(operator);
    const row = await this.prisma.operatorProfile.upsert({
      where: { id: operator.id },
      create: data,
      update: data,
    });
    return toOperatorProfile(row);
  }
}

@Injectable()
export class MatchesRepository implements MatchesRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async replaceForInvestor(investorId: string, matches: MatchResult[]): Promise<MatchResult[]> {
    await this.prisma.$transaction([
      this.prisma.matchResult.deleteMany({ where: { investorId } }),
      ...matches.map((match) =>
        this.prisma.matchResult.create({ data: matchResultData(match) })
      ),
    ]);
    return this.findForInvestor(investorId);
  }

  async findForInvestor(investorId: string): Promise<MatchResult[]> {
    const rows = await this.prisma.matchResult.findMany({
      where: { investorId },
      orderBy: { score: 'desc' },
    });
    return rows.map(toMatchResult);
  }
}

@Injectable()
export class DealsRepository implements DealsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async save(deal: DealRecommendation): Promise<DealRecommendation> {
    const data = dealRecommendationData(deal);
    const row = await this.prisma.dealRecommendation.upsert({
      where: { id: deal.id },
      create: data,
      update: data,
    });
    return toDealRecommendation(row);
  }

  async findById(id: string): Promise<DealRecommendation | null> {
    const row = await this.prisma.dealRecommendation.findUnique({ where: { id } });
    return row ? toDealRecommendation(row) : null;
  }

  async findForInvestor(investorId: string): Promise<DealRecommendation[]> {
    const rows = await this.prisma.dealRecommendation.findMany({
      where: { investorId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDealRecommendation);
  }

  async findForFarm(farmId: string): Promise<DealRecommendation[]> {
    const rows = await this.prisma.dealRecommendation.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDealRecommendation);
  }
}

@Injectable()
export class NotificationsRepository implements NotificationsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async saveMany(signals: NotificationSignal[]): Promise<NotificationSignal[]> {
    for (const signal of signals) {
      const data = notificationSignalData(signal);
      await this.prisma.notificationSignal.upsert({
        where: { id: signal.id },
        create: data,
        update: data,
      });
    }
    return signals;
  }

  async findAll(): Promise<NotificationSignal[]> {
    const rows = await this.prisma.notificationSignal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toNotificationSignal);
  }

  async findById(id: string): Promise<NotificationSignal | null> {
    const row = await this.prisma.notificationSignal.findUnique({ where: { id } });
    return row ? toNotificationSignal(row) : null;
  }

  async findForFarm(farmId: string): Promise<NotificationSignal[]> {
    const rows = await this.prisma.notificationSignal.findMany({
      where: { affectedFarmIds: { has: farmId } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toNotificationSignal);
  }
}

@Injectable()
export class ReportsRepository implements ReportsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async save(report: OperatorReport): Promise<OperatorReport> {
    const data = operatorReportData(report);
    const row = await this.prisma.operatorReport.upsert({
      where: { id: report.id },
      create: data,
      update: data,
    });
    return toOperatorReport(row);
  }

  async findForFarm(farmId: string): Promise<OperatorReport[]> {
    const rows = await this.prisma.operatorReport.findMany({
      where: { farmId },
      orderBy: { submittedAt: 'desc' },
    });
    return rows.map(toOperatorReport);
  }

  async findForOperator(operatorId: string): Promise<OperatorReport[]> {
    const rows = await this.prisma.operatorReport.findMany({
      where: { operatorId },
      orderBy: { submittedAt: 'desc' },
    });
    return rows.map(toOperatorReport);
  }
}

@Injectable()
export class AdminRepository implements AdminRepositoryContract {
  constructor(private readonly prisma: PrismaService) {}

  async findReviewQueue(status?: AdminReviewItem['status']): Promise<AdminReviewItem[]> {
    const rows = await this.prisma.adminReviewItem.findMany({
      where: status ? { status } : undefined,
    });
    return rows.map(toAdminReviewItem).sort((a, b) => {
      const order = { pending: 0, escalated: 1, approved: 2, rejected: 3, overridden: 4 };
      return order[a.status] - order[b.status];
    });
  }

  async findReviewItem(id: string): Promise<AdminReviewItem | null> {
    const row = await this.prisma.adminReviewItem.findUnique({ where: { id } });
    return row ? toAdminReviewItem(row) : null;
  }

  async saveReviewItem(item: AdminReviewItem): Promise<AdminReviewItem> {
    const data = adminReviewItemData(item);
    const row = await this.prisma.adminReviewItem.upsert({
      where: { id: item.id },
      create: data,
      update: data,
    });
    return toAdminReviewItem(row);
  }

  async saveAuditLog(entry: AuditLogEntry): Promise<AuditLogEntry> {
    const row = await this.prisma.auditLogEntry.create({
      data: {
        id: entry.id,
        adminId: entry.adminId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        before: entry.before as never,
        after: entry.after as never,
        timestamp: new Date(entry.timestamp),
      },
    });
    return toAuditLogEntry(row);
  }

  async findAuditLog(): Promise<AuditLogEntry[]> {
    const rows = await this.prisma.auditLogEntry.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return rows.map(toAuditLogEntry);
  }
}
