import {
  AdminReviewItem,
  AuditLogEntry,
  DealRecommendation,
  DealTerm,
  FarmProfile,
  InvestorPreferences,
  InvestorProfile,
  MatchReason,
  MatchResult,
  NotificationSignal,
  OperatorProfile,
  OperatorReport,
  RiskFlag,
  YieldHistory,
} from '@ai-sprints/shared-types';
import { Prisma } from '@prisma/client';

const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : value;

const jsonArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const jsonObject = <T>(value: unknown, fallback: T): T =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as T) : fallback;

export const toFarmProfile = (row: any): FarmProfile => ({
  id: row.id,
  operatorId: row.operatorId,
  name: row.name,
  country: row.country,
  region: row.region,
  governorate: row.governorate,
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  areaHectares: row.areaHectares,
  soilType: row.soilType,
  waterSource: row.waterSource,
  currentCrop: row.currentCrop,
  plannedCrops: row.plannedCrops,
  requestedCapitalUsd: row.requestedCapitalUsd,
  projectedRoiPercent: row.projectedRoiPercent,
  cropCycleDays: row.cropCycleDays,
  yieldHistory: jsonArray<YieldHistory>(row.yieldHistory),
  certifications: row.certifications,
  documentUrls: row.documentUrls,
  imageUrls: row.imageUrls,
  status: row.status,
  aiProfileSummary: row.aiProfileSummary ?? undefined,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const farmProfileData = (farm: FarmProfile) => ({
  id: farm.id,
  operatorId: farm.operatorId,
  name: farm.name,
  country: farm.country,
  region: farm.region,
  governorate: farm.governorate,
  latitude: farm.latitude ?? null,
  longitude: farm.longitude ?? null,
  areaHectares: farm.areaHectares,
  soilType: farm.soilType,
  waterSource: farm.waterSource,
  currentCrop: farm.currentCrop,
  plannedCrops: farm.plannedCrops,
  requestedCapitalUsd: farm.requestedCapitalUsd,
  projectedRoiPercent: farm.projectedRoiPercent,
  cropCycleDays: farm.cropCycleDays,
  yieldHistory: farm.yieldHistory as unknown as Prisma.InputJsonValue,
  certifications: farm.certifications,
  documentUrls: farm.documentUrls,
  imageUrls: farm.imageUrls,
  status: farm.status,
  aiProfileSummary: farm.aiProfileSummary ?? null,
  createdAt: new Date(farm.createdAt),
  updatedAt: new Date(farm.updatedAt),
});

export const toInvestorProfile = (row: any): InvestorProfile => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  preferences: jsonObject<InvestorPreferences>(row.preferences, {
    investorId: row.id,
    riskTolerance: 'medium',
    investmentHorizonMonths: 12,
    capitalBudgetUsd: 50000,
    liquidityPreference: 'medium',
    preferredCrops: [],
    preferredRegions: [],
    expectedRoiPercent: 15,
    sustainabilityFocus: false,
  }),
  portfolio: row.portfolio,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const investorProfileData = (investor: InvestorProfile) => ({
  id: investor.id,
  userId: investor.userId,
  name: investor.name,
  preferences: investor.preferences as unknown as Prisma.InputJsonValue,
  portfolio: investor.portfolio,
  createdAt: new Date(investor.createdAt),
  updatedAt: new Date(investor.updatedAt),
});

export const toOperatorProfile = (row: any): OperatorProfile => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  phone: row.phone,
  whatsappNumber: row.whatsappNumber ?? undefined,
  region: row.region,
  farmIds: row.farmIds,
  verificationStatus: row.verificationStatus,
  createdAt: iso(row.createdAt),
});

export const operatorProfileData = (operator: OperatorProfile) => ({
  id: operator.id,
  userId: operator.userId,
  name: operator.name,
  phone: operator.phone,
  whatsappNumber: operator.whatsappNumber ?? null,
  region: operator.region,
  farmIds: operator.farmIds,
  verificationStatus: operator.verificationStatus,
  createdAt: new Date(operator.createdAt),
});

export const toMatchResult = (row: any): MatchResult => ({
  farmId: row.farmId,
  investorId: row.investorId,
  score: row.score,
  confidence: row.confidence,
  reasons: jsonArray<MatchReason>(row.reasons),
  riskFlags: jsonArray<RiskFlag>(row.riskFlags),
  horizonFitMonths: row.horizonFitMonths,
  estimatedRoiPercent: row.estimatedRoiPercent,
  createdAt: iso(row.createdAt),
});

export const matchResultData = (match: MatchResult) => ({
  id: `${match.investorId}:${match.farmId}`,
  farmId: match.farmId,
  investorId: match.investorId,
  score: match.score,
  confidence: match.confidence,
  reasons: match.reasons as unknown as Prisma.InputJsonValue,
  riskFlags: match.riskFlags as unknown as Prisma.InputJsonValue,
  horizonFitMonths: match.horizonFitMonths,
  estimatedRoiPercent: match.estimatedRoiPercent,
  createdAt: new Date(match.createdAt),
});

export const toDealRecommendation = (row: any): DealRecommendation => ({
  id: row.id,
  farmId: row.farmId,
  investorId: row.investorId,
  structureType: row.structureType,
  recommendedInvestmentUsd: row.recommendedInvestmentUsd,
  projectedRoiPercent: row.projectedRoiPercent,
  durationMonths: row.durationMonths,
  terms: jsonArray<DealTerm>(row.terms),
  rationale: row.rationale,
  riskSummary: row.riskSummary,
  aiConfidence: row.aiConfidence,
  createdAt: iso(row.createdAt),
});

export const dealRecommendationData = (deal: DealRecommendation) => ({
  id: deal.id,
  farmId: deal.farmId,
  investorId: deal.investorId,
  structureType: deal.structureType,
  recommendedInvestmentUsd: deal.recommendedInvestmentUsd,
  projectedRoiPercent: deal.projectedRoiPercent,
  durationMonths: deal.durationMonths,
  terms: deal.terms as unknown as Prisma.InputJsonValue,
  rationale: deal.rationale,
  riskSummary: deal.riskSummary,
  aiConfidence: deal.aiConfidence,
  createdAt: new Date(deal.createdAt),
});

export const toNotificationSignal = (row: any): NotificationSignal => ({
  id: row.id,
  alertType: row.alertType,
  severity: row.severity,
  title: row.title,
  summary: row.summary,
  affectedFarmIds: row.affectedFarmIds,
  affectedInvestorIds: row.affectedInvestorIds,
  reasoning: row.reasoning,
  sourceUrl: row.sourceUrl ?? undefined,
  actionRequired: row.actionRequired,
  createdAt: iso(row.createdAt),
});

export const notificationSignalData = (signal: NotificationSignal) => ({
  id: signal.id,
  alertType: signal.alertType,
  severity: signal.severity,
  title: signal.title,
  summary: signal.summary,
  affectedFarmIds: signal.affectedFarmIds,
  affectedInvestorIds: signal.affectedInvestorIds,
  reasoning: signal.reasoning,
  sourceUrl: signal.sourceUrl ?? null,
  actionRequired: signal.actionRequired,
  createdAt: new Date(signal.createdAt),
});

export const toOperatorReport = (row: any): OperatorReport => ({
  id: row.id,
  farmId: row.farmId,
  operatorId: row.operatorId,
  reportType: row.reportType,
  period: row.period,
  content: jsonObject<Record<string, unknown>>(row.content, {}),
  notes: row.notes,
  submittedAt: iso(row.submittedAt),
});

export const operatorReportData = (report: OperatorReport) => ({
  id: report.id,
  farmId: report.farmId,
  operatorId: report.operatorId,
  reportType: report.reportType,
  period: report.period,
  content: report.content as Prisma.InputJsonValue,
  notes: report.notes,
  submittedAt: new Date(report.submittedAt),
});

export const toAdminReviewItem = (row: any): AdminReviewItem => ({
  id: row.id,
  itemType: row.itemType,
  targetId: row.targetId,
  status: row.status,
  aiSummary: row.aiSummary,
  flags: jsonArray<RiskFlag>(row.flags),
  reviewedBy: row.reviewedBy ?? undefined,
  reviewNote: row.reviewNote ?? undefined,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const adminReviewItemData = (item: AdminReviewItem) => ({
  id: item.id,
  itemType: item.itemType,
  targetId: item.targetId,
  status: item.status,
  aiSummary: item.aiSummary,
  flags: item.flags as unknown as Prisma.InputJsonValue,
  reviewedBy: item.reviewedBy ?? null,
  reviewNote: item.reviewNote ?? null,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
});

export const toAuditLogEntry = (row: any): AuditLogEntry => ({
  id: row.id,
  adminId: row.adminId,
  action: row.action,
  targetType: row.targetType,
  targetId: row.targetId,
  before: row.before ?? undefined,
  after: row.after ?? undefined,
  timestamp: iso(row.timestamp),
});
