import { FarmProfile, WeatherForecast, NewsSignal, NotificationSignal, AlertType, AlertSeverity } from '@ai-sprints/shared-types';

/**
 * Analyses weather and news signals to produce actionable NotificationSignals
 * for relevant farms and investors.
 */
export function reasonAboutAlerts(
  farms: FarmProfile[],
  weatherForecasts: WeatherForecast[],
  newsSignals: NewsSignal[]
): NotificationSignal[] {
  const alerts: NotificationSignal[] = [];
  let idCounter = 1;

  // ── Weather alerts ────────────────────────────────────────────────────────
  for (const forecast of weatherForecasts) {
    const affectedFarms = farms.filter(f =>
      f.region === forecast.region || f.id === forecast.farmId
    );
    if (affectedFarms.length === 0) continue;

    if (forecast.riskLevel === 'high') {
      const severity: AlertSeverity = forecast.rainfallMm > 80 ? 'critical' : 'warning';
      const alertType: AlertType = 'weather';
      alerts.push({
        id: `alert-${idCounter++}`,
        alertType,
        severity,
        title: `${severity === 'critical' ? '🚨 Critical' : '⚠️ Warning'}: Extreme Weather in ${forecast.region}`,
        summary: `${forecast.condition} expected — ${forecast.rainfallMm}mm rainfall, ${forecast.temperatureCelsius}°C. Risk to active crops.`,
        affectedFarmIds: affectedFarms.map(f => f.id),
        affectedInvestorIds: [],
        reasoning: `Weather model indicates ${forecast.riskLevel} risk for ${forecast.region}. ` +
          `${forecast.rainfallMm}mm is ${forecast.rainfallMm > 60 ? 'significantly above' : 'above'} seasonal average. ` +
          `Farms with rain-dependent water sources are most exposed.`,
        actionRequired: severity === 'critical',
        createdAt: new Date().toISOString(),
      });
    } else if (forecast.riskLevel === 'medium') {
      alerts.push({
        id: `alert-${idCounter++}`,
        alertType: 'weather',
        severity: 'info',
        title: `🌤 Weather Watch: ${forecast.region}`,
        summary: `${forecast.condition} forecast. Monitor crop hydration levels.`,
        affectedFarmIds: affectedFarms.map(f => f.id),
        affectedInvestorIds: [],
        reasoning: `Moderate weather variation detected. No immediate action required but operator awareness recommended.`,
        actionRequired: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // ── News / market alerts ──────────────────────────────────────────────────
  for (const news of newsSignals) {
    const affectedFarms = farms.filter(f =>
      news.affectedCrops.includes(f.currentCrop) ||
      news.affectedRegions.includes(f.region)
    );
    if (affectedFarms.length === 0) continue;

    const severity: AlertSeverity = news.sentiment === 'negative' ? 'warning' : 'info';
    const alertType: AlertType = news.relevance === 'policy' ? 'regulatory' : 'market';

    alerts.push({
      id: `alert-${idCounter++}`,
      alertType,
      severity,
      title: news.headline,
      summary: `${news.relevance.toUpperCase()} signal from ${news.source}. Affects ${news.affectedCrops.join(', ')} in ${news.affectedRegions.join(', ')}.`,
      affectedFarmIds: affectedFarms.map(f => f.id),
      affectedInvestorIds: [],
      reasoning: `News sentiment is ${news.sentiment} for ${news.affectedCrops.join('/')} crops. ` +
        `${affectedFarms.length} farm(s) in portfolio may be impacted. ` +
        (news.sentiment === 'negative'
          ? 'Recommend operator check-in to assess exposure.'
          : 'Positive market movement may support projected ROI.'),
      sourceUrl: undefined,
      actionRequired: news.sentiment === 'negative',
      createdAt: new Date().toISOString(),
    });
  }

  // ── Sort: critical first, then warning, then info ─────────────────────────
  const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}
