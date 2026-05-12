import { FarmProfile, InvestorPreferences, DealRecommendation, DealStructureType, DealTerm } from '@ai-sprints/shared-types';

/**
 * Recommends an optimal deal structure for a given farm + investor combination.
 */
export function recommendDealStructure(
  farm: FarmProfile,
  preferences: InvestorPreferences
): DealRecommendation {
  const id = `deal-${farm.id}-${preferences.investorId}-${Date.now()}`;

  // ── Choose structure type based on risk tolerance and horizon ─────────────
  let structureType: DealStructureType;
  const isLongHorizon = preferences.investmentHorizonMonths >= 18;
  const isHighRisk = preferences.riskTolerance === 'high';
  const isLowRisk = preferences.riskTolerance === 'low';

  if (isLowRisk && !isLongHorizon) {
    structureType = 'loan';
  } else if (isHighRisk && isLongHorizon) {
    structureType = 'equity';
  } else if (isLongHorizon) {
    structureType = 'revenue_share';
  } else if (preferences.liquidityPreference === 'high') {
    structureType = 'convertible_note';
  } else {
    structureType = 'hybrid';
  }

  // ── Recommended investment amount ──────────────────────────────────────────
  const recommended = Math.min(
    farm.requestedCapitalUsd,
    preferences.capitalBudgetUsd * 0.8 // don't over-concentrate
  );

  // ── ROI projection ─────────────────────────────────────────────────────────
  const baseRoi = farm.projectedRoiPercent;
  const structureMultiplier: Record<DealStructureType, number> = {
    loan: 0.7,
    revenue_share: 0.9,
    equity: 1.2,
    convertible_note: 1.0,
    hybrid: 0.95,
  };
  const projectedRoi = +(baseRoi * structureMultiplier[structureType]).toFixed(1);

  // ── Deal duration ─────────────────────────────────────────────────────────
  const durationMonths = Math.min(
    preferences.investmentHorizonMonths,
    Math.ceil(farm.cropCycleDays / 30) + 3
  );

  // ── Terms ─────────────────────────────────────────────────────────────────
  const terms: DealTerm[] = buildTerms(structureType, recommended, projectedRoi, durationMonths, farm);

  // ── Rationale ────────────────────────────────────────────────────────────
  const rationale = buildRationale(structureType, farm, preferences, projectedRoi);

  // ── Risk summary ──────────────────────────────────────────────────────────
  const riskSummary = buildRiskSummary(farm, preferences);

  const confidence: DealRecommendation['aiConfidence'] =
    farm.yieldHistory.length > 1 && projectedRoi >= preferences.expectedRoiPercent
      ? 'high'
      : farm.yieldHistory.length > 0
      ? 'medium'
      : 'low';

  return {
    id,
    farmId: farm.id,
    investorId: preferences.investorId,
    structureType,
    recommendedInvestmentUsd: Math.round(recommended),
    projectedRoiPercent: projectedRoi,
    durationMonths,
    terms,
    rationale,
    riskSummary,
    aiConfidence: confidence,
    createdAt: new Date().toISOString(),
  };
}

function buildTerms(
  type: DealStructureType,
  amount: number,
  roi: number,
  months: number,
  farm: FarmProfile
): DealTerm[] {
  const base: DealTerm[] = [
    { label: 'Investment Amount', value: `$${amount.toLocaleString()} USD` },
    { label: 'Duration', value: `${months} months` },
    { label: 'Projected ROI', value: `${roi}%` },
  ];

  if (type === 'revenue_share') {
    return [...base,
      { label: 'Revenue Share', value: `${Math.round(roi * 2)}% of gross revenue` },
      { label: 'Distribution', value: 'End of crop cycle' },
      { label: 'Exit Right', value: 'Transferable after 6 months' },
    ];
  }
  if (type === 'equity') {
    return [...base,
      { label: 'Equity Stake', value: `${Math.round(amount / (farm.requestedCapitalUsd / 100))}%` },
      { label: 'Governance', value: 'Observer rights on quarterly reports' },
      { label: 'Exit', value: 'Secondary market or buyback at 36 months' },
    ];
  }
  if (type === 'loan') {
    return [...base,
      { label: 'Interest Rate', value: `${roi}% p.a.` },
      { label: 'Repayment', value: 'Balloon at end of cycle' },
      { label: 'Collateral', value: 'Farm equipment and crop lien' },
    ];
  }
  if (type === 'convertible_note') {
    return [...base,
      { label: 'Conversion Trigger', value: 'Next funding round or 12 months' },
      { label: 'Discount Rate', value: '20% on conversion' },
      { label: 'Interest', value: `${(roi * 0.5).toFixed(1)}% accrued` },
    ];
  }
  return [...base,
    { label: 'Structure Split', value: '60% revenue share + 40% loan' },
    { label: 'Review Point', value: '6-month performance gate' },
  ];
}

function buildRationale(
  type: DealStructureType,
  farm: FarmProfile,
  prefs: InvestorPreferences,
  roi: number
): string {
  const structureLabels: Record<DealStructureType, string> = {
    loan: 'Fixed-return loan',
    revenue_share: 'Revenue share partnership',
    equity: 'Equity stake',
    convertible_note: 'Convertible note',
    hybrid: 'Hybrid structure',
  };
  return `A ${structureLabels[type]} is recommended for this opportunity. ` +
    `${farm.name} in ${farm.region} is cultivating ${farm.currentCrop} across ${farm.areaHectares} hectares ` +
    `with a projected ROI of ${roi}%. ` +
    `Given your ${prefs.riskTolerance} risk tolerance and ${prefs.investmentHorizonMonths}-month horizon, ` +
    `this structure optimizes your return while preserving appropriate downside protection. ` +
    (farm.yieldHistory.length > 0
      ? `Historical yield data from ${farm.yieldHistory.length} season(s) supports this projection.`
      : `Note: This farm lacks historical yield data — we recommend a phased investment approach.`);
}

function buildRiskSummary(farm: FarmProfile, prefs: InvestorPreferences): string {
  const risks: string[] = [];
  if (farm.yieldHistory.length === 0) risks.push('no historical yield data');
  if (farm.requestedCapitalUsd > prefs.capitalBudgetUsd * 0.9) risks.push('capital concentration risk');
  if (farm.waterSource === 'rainwater') risks.push('weather-dependent water supply');
  if (farm.cropCycleDays > prefs.investmentHorizonMonths * 30) risks.push('cycle extends beyond preferred horizon');

  if (risks.length === 0) return 'No major risk factors identified. Standard agricultural and market risks apply.';
  return `Key risks to monitor: ${risks.join('; ')}. Recommend quarterly operator check-ins.`;
}
