// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'investor' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
}

// ─── Investor ─────────────────────────────────────────────────────────────────

export interface InvestorPreferences {
  investorId: string;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentHorizonMonths: number;
  capitalBudgetUsd: number;
  liquidityPreference: 'low' | 'medium' | 'high';
  preferredCrops: string[];
  preferredRegions: string[];
  expectedRoiPercent: number;
  sustainabilityFocus: boolean;
}

export interface InvestorProfile {
  id: string;
  userId: string;
  name: string;
  preferences: InvestorPreferences;
  portfolio: string[]; // farm IDs in watchlist
  createdAt: string;
  updatedAt: string;
}

// ─── Operator ─────────────────────────────────────────────────────────────────

export interface OperatorProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  region: string;
  farmIds: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

// ─── Farm ─────────────────────────────────────────────────────────────────────

export type SoilType = 'clay' | 'sandy' | 'loamy' | 'silt' | 'chalky' | 'peaty';
export type WaterSource = 'nile' | 'groundwater' | 'rainwater' | 'irrigation_canal' | 'mixed';
export type FarmStatus = 'pending_review' | 'active' | 'funded' | 'rejected' | 'completed';

export interface YieldHistory {
  year: number;
  cropName: string;
  tonnesPerHectare: number;
  revenueUsd: number;
}

export interface FarmProfile {
  id: string;
  operatorId: string;
  name: string;
  country: string;
  region: string;
  governorate: string;
  latitude?: number;
  longitude?: number;
  areaHectares: number;
  soilType: SoilType;
  waterSource: WaterSource;
  currentCrop: string;
  plannedCrops: string[];
  requestedCapitalUsd: number;
  projectedRoiPercent: number;
  cropCycleDays: number;
  yieldHistory: YieldHistory[];
  certifications: string[];
  documentUrls: string[];
  imageUrls: string[];
  status: FarmStatus;
  aiProfileSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Matching ────────────────────────────────────────────────────────────────

export interface MatchReason {
  category: 'risk' | 'roi' | 'horizon' | 'region' | 'crop' | 'sustainability';
  label: string;
  detail: string;
  positive: boolean;
}

export interface RiskFlag {
  severity: 'low' | 'medium' | 'high';
  label: string;
  detail: string;
}

export interface MatchResult {
  farmId: string;
  investorId: string;
  score: number; // 0–100
  confidence: 'low' | 'medium' | 'high';
  reasons: MatchReason[];
  riskFlags: RiskFlag[];
  horizonFitMonths: number;
  estimatedRoiPercent: number;
  createdAt: string;
}

// ─── Deal Recommendation ──────────────────────────────────────────────────────

export type DealStructureType =
  | 'revenue_share'
  | 'equity'
  | 'loan'
  | 'convertible_note'
  | 'hybrid';

export interface DealTerm {
  label: string;
  value: string;
}

export interface DealRecommendation {
  id: string;
  farmId: string;
  investorId: string;
  structureType: DealStructureType;
  recommendedInvestmentUsd: number;
  projectedRoiPercent: number;
  durationMonths: number;
  terms: DealTerm[];
  rationale: string;
  riskSummary: string;
  aiConfidence: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ─── Notifications / Alerts ───────────────────────────────────────────────────

export type AlertType = 'weather' | 'news' | 'market' | 'operational' | 'regulatory';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface NotificationSignal {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  summary: string;
  affectedFarmIds: string[];
  affectedInvestorIds: string[];
  reasoning: string;
  sourceUrl?: string;
  actionRequired: boolean;
  createdAt: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface OperatorReport {
  id: string;
  farmId: string;
  operatorId: string;
  reportType: 'yield' | 'status' | 'incident' | 'financial';
  period: string; // e.g. "2025-Q2"
  content: Record<string, unknown>;
  notes: string;
  submittedAt: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export type ReviewItemType = 'farm_profile' | 'match_result' | 'deal_recommendation' | 'alert';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'overridden' | 'escalated';

export interface AdminReviewItem {
  id: string;
  itemType: ReviewItemType;
  targetId: string; // farm/match/deal/alert ID
  status: ReviewStatus;
  aiSummary: string;
  flags: RiskFlag[];
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  timestamp: string;
}

// ─── Integration Contracts ────────────────────────────────────────────────────

export interface WeatherForecast {
  farmId: string;
  region: string;
  temperatureCelsius: number;
  rainfallMm: number;
  humidity: number;
  condition: string;
  riskLevel: 'low' | 'medium' | 'high';
  forecastDate: string;
}

export interface NewsSignal {
  id: string;
  headline: string;
  source: string;
  relevance: 'agriculture' | 'market' | 'policy' | 'climate';
  sentiment: 'positive' | 'neutral' | 'negative';
  affectedCrops: string[];
  affectedRegions: string[];
  publishedAt: string;
  sourceUrl?: string;
}

export interface GeospatialData {
  farmId: string;
  ndviScore: number; // 0–1, vegetation health
  soilMoisturePercent: number;
  elevationMeters: number;
  nearestWaterBodyKm: number;
  floodRiskScore: number; // 0–10
  droughtRiskScore: number; // 0–10
  updatedAt: string;
}
