import { FarmProfile, InvestorPreferences, MatchResult, MatchReason, RiskFlag } from '@ai-sprints/shared-types';

/**
 * Ranks farms against investor preferences using a multi-factor scoring model.
 * Returns sorted MatchResult[] with reasons and risk flags.
 */
export function rankInvestmentMatches(
  investorId: string,
  preferences: InvestorPreferences,
  farms: FarmProfile[]
): MatchResult[] {
  const results: MatchResult[] = farms
    .filter(f => f.status === 'active' || f.status === 'pending_review')
    .map(farm => {
      const reasons: MatchReason[] = [];
      const riskFlags: RiskFlag[] = [];
      let score = 50; // baseline

      // ── ROI fit ──────────────────────────────────────────────────────────────
      const roiDiff = farm.projectedRoiPercent - preferences.expectedRoiPercent;
      if (roiDiff >= 0) {
        score += Math.min(roiDiff * 2, 20);
        reasons.push({
          category: 'roi',
          label: 'ROI Exceeds Target',
          detail: `Farm projects ${farm.projectedRoiPercent}% vs your ${preferences.expectedRoiPercent}% target`,
          positive: true,
        });
      } else {
        score += roiDiff * 3; // penalty
        reasons.push({
          category: 'roi',
          label: 'ROI Below Target',
          detail: `Farm projects ${farm.projectedRoiPercent}% vs your ${preferences.expectedRoiPercent}% target`,
          positive: false,
        });
      }

      // ── Risk tolerance fit ────────────────────────────────────────────────────
      const riskScore = { low: 1, medium: 2, high: 3 }[preferences.riskTolerance];
      const farmRisk = farm.yieldHistory.length > 2 ? 1 : farm.yieldHistory.length > 0 ? 2 : 3;
      if (farmRisk <= riskScore) {
        score += 10;
        reasons.push({
          category: 'risk',
          label: 'Risk Profile Match',
          detail: 'Farm risk level aligns with your tolerance',
          positive: true,
        });
      } else {
        score -= 10;
        riskFlags.push({ severity: 'medium', label: 'Higher Risk Than Preferred', detail: 'Farm risk exceeds stated tolerance' });
        reasons.push({
          category: 'risk',
          label: 'Risk Mismatch',
          detail: 'Farm may be riskier than your stated tolerance',
          positive: false,
        });
      }

      // ── Horizon fit ───────────────────────────────────────────────────────────
      if (farm.cropCycleDays <= preferences.investmentHorizonMonths * 30) {
        score += 10;
        reasons.push({
          category: 'horizon',
          label: 'Horizon Fit',
          detail: `${farm.cropCycleDays}-day cycle fits your ${preferences.investmentHorizonMonths}-month horizon`,
          positive: true,
        });
      } else {
        score -= 5;
        reasons.push({
          category: 'horizon',
          label: 'Longer Than Horizon',
          detail: `${farm.cropCycleDays}-day cycle exceeds your ${preferences.investmentHorizonMonths}-month horizon`,
          positive: false,
        });
      }

      // ── Budget fit ────────────────────────────────────────────────────────────
      if (farm.requestedCapitalUsd <= preferences.capitalBudgetUsd) {
        score += 10;
        reasons.push({
          category: 'roi',
          label: 'Within Budget',
          detail: `Requesting $${farm.requestedCapitalUsd.toLocaleString()} vs your $${preferences.capitalBudgetUsd.toLocaleString()} budget`,
          positive: true,
        });
      } else {
        score -= 20;
        riskFlags.push({ severity: 'high', label: 'Exceeds Budget', detail: `Farm requests more capital than your stated budget` });
      }

      // ── Region preference ─────────────────────────────────────────────────────
      if (preferences.preferredRegions.length === 0 || preferences.preferredRegions.includes(farm.region)) {
        score += 5;
        reasons.push({
          category: 'region',
          label: 'Preferred Region',
          detail: `${farm.region} matches your regional preference`,
          positive: true,
        });
      }

      // ── Crop preference ───────────────────────────────────────────────────────
      if (preferences.preferredCrops.length === 0 || preferences.preferredCrops.includes(farm.currentCrop)) {
        score += 5;
        reasons.push({
          category: 'crop',
          label: 'Preferred Crop',
          detail: `${farm.currentCrop} is on your preferred crops list`,
          positive: true,
        });
      }

      // ── Sustainability ────────────────────────────────────────────────────────
      if (preferences.sustainabilityFocus && farm.certifications.length > 0) {
        score += 5;
        reasons.push({
          category: 'sustainability',
          label: 'Certified Farm',
          detail: `Farm holds ${farm.certifications.join(', ')} certifications`,
          positive: true,
        });
      }

      // ── No yield history risk flag ─────────────────────────────────────────────
      if (farm.yieldHistory.length === 0) {
        riskFlags.push({ severity: 'medium', label: 'No Yield History', detail: 'Farm has not submitted historical yield data' });
      }

      const clampedScore = Math.max(0, Math.min(100, score));
      const confidence: MatchResult['confidence'] =
        clampedScore > 70 ? 'high' : clampedScore > 45 ? 'medium' : 'low';

      return {
        farmId: farm.id,
        investorId,
        score: clampedScore,
        confidence,
        reasons,
        riskFlags,
        horizonFitMonths: Math.round(farm.cropCycleDays / 30),
        estimatedRoiPercent: farm.projectedRoiPercent,
        createdAt: new Date().toISOString(),
      };
    });

  return results.sort((a, b) => b.score - a.score);
}
