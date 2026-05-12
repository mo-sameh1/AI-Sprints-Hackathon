import { Injectable } from '@nestjs/common';
import { NotificationSignal, WeatherForecast, NewsSignal } from '@ai-sprints/shared-types';
import { reasonAboutAlerts } from '@ai-sprints/ai-worker';

const signalStore = new Map<string, NotificationSignal>();

// Seed some mock signals
const mockWeather: WeatherForecast[] = [
  { farmId: 'farm-001', region: 'Delta', temperatureCelsius: 38, rainfallMm: 95, humidity: 80, condition: 'Heavy Thunderstorms', riskLevel: 'high', forecastDate: new Date().toISOString() },
  { farmId: 'farm-003', region: 'Fayoum', temperatureCelsius: 42, rainfallMm: 5, humidity: 25, condition: 'Extreme Heat', riskLevel: 'medium', forecastDate: new Date().toISOString() },
];
const mockNews: NewsSignal[] = [
  { id: 'news-001', headline: 'Egypt raises wheat import tariffs — domestic producers benefit', source: 'AlAhram Business', relevance: 'policy', sentiment: 'positive', affectedCrops: ['wheat'], affectedRegions: ['Delta', 'Upper Egypt'], publishedAt: new Date().toISOString() },
  { id: 'news-002', headline: 'Tomato prices drop 18% amid regional oversupply', source: 'AgriMarket Egypt', relevance: 'market', sentiment: 'negative', affectedCrops: ['tomato', 'potato'], affectedRegions: ['Fayoum'], publishedAt: new Date().toISOString() },
];

@Injectable()
export class NotificationsService {
  constructor() {
    // Pre-generate signals from mock data
    this.evaluateSignals({ weatherForecasts: mockWeather, newsSignals: mockNews });
  }

  evaluateSignals(payload: { weatherForecasts?: WeatherForecast[]; newsSignals?: NewsSignal[]; farmIds?: string[] }): NotificationSignal[] {
    // We'd normally fetch farms from DB; use placeholder list here
    const fakeFarms = [
      { id: 'farm-001', region: 'Delta', currentCrop: 'wheat', status: 'active' as const },
      { id: 'farm-002', region: 'Upper Egypt', currentCrop: 'citrus', status: 'active' as const },
      { id: 'farm-003', region: 'Fayoum', currentCrop: 'tomato', status: 'active' as const },
    ] as never;

    const signals = reasonAboutAlerts(
      fakeFarms,
      payload.weatherForecasts ?? [],
      payload.newsSignals ?? []
    );
    signals.forEach(s => signalStore.set(s.id, s));
    return signals;
  }

  getAllSignals(): NotificationSignal[] {
    return Array.from(signalStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getSignalById(id: string): NotificationSignal | { error: string } {
    return signalStore.get(id) ?? { error: `Signal ${id} not found` };
  }

  getSignalsForFarm(farmId: string): NotificationSignal[] {
    return Array.from(signalStore.values()).filter(s => s.affectedFarmIds.includes(farmId));
  }
}
