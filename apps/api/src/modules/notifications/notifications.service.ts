import { Injectable } from '@nestjs/common';
import {
  FarmProfile,
  NewsSignal,
  NotificationSignal,
  WeatherForecast,
} from '@ai-sprints/shared-types';
import { reasonAboutAlerts } from '@ai-sprints/ai-worker';
import { NewsProvider } from '../integrations/news/news.provider';
import { WeatherProvider } from '../integrations/weather/weather.provider';

const signalStore = new Map<string, NotificationSignal>();

@Injectable()
export class NotificationsService {
  constructor(
    private readonly weatherProvider: WeatherProvider,
    private readonly newsProvider: NewsProvider
  ) {
    this.evaluateSignals();
  }

  evaluateSignals(
    payload: {
      weatherForecasts?: WeatherForecast[];
      newsSignals?: NewsSignal[];
      farmIds?: string[];
    } = {}
  ): NotificationSignal[] {
    const fakeFarms = this.getDemoFarms(payload.farmIds);
    const weatherForecasts =
      payload.weatherForecasts ??
      this.weatherProvider.fetchForecast({ farmIds: payload.farmIds }).forecasts;
    const newsSignals = payload.newsSignals ?? this.newsProvider.fetchSignals().signals;

    const signals = reasonAboutAlerts(fakeFarms, weatherForecasts, newsSignals);
    signals.forEach((signal) => signalStore.set(signal.id, signal));
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
    return Array.from(signalStore.values()).filter((signal) =>
      signal.affectedFarmIds.includes(farmId)
    );
  }

  private getDemoFarms(farmIds?: string[]): FarmProfile[] {
    const farms: FarmProfile[] = [
      {
        id: 'farm-001',
        operatorId: 'operator-001',
        name: 'Delta Wheat Cooperative',
        country: 'Egypt',
        region: 'Delta',
        governorate: 'Dakahlia',
        areaHectares: 42,
        soilType: 'clay',
        waterSource: 'irrigation_canal',
        currentCrop: 'wheat',
        plannedCrops: ['wheat', 'maize'],
        requestedCapitalUsd: 120000,
        projectedRoiPercent: 18,
        cropCycleDays: 150,
        yieldHistory: [],
        certifications: [],
        documentUrls: [],
        imageUrls: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'farm-002',
        operatorId: 'operator-002',
        name: 'Upper Egypt Citrus Farm',
        country: 'Egypt',
        region: 'Upper Egypt',
        governorate: 'Luxor',
        areaHectares: 24,
        soilType: 'sandy',
        waterSource: 'nile',
        currentCrop: 'citrus',
        plannedCrops: ['citrus'],
        requestedCapitalUsd: 90000,
        projectedRoiPercent: 16,
        cropCycleDays: 210,
        yieldHistory: [],
        certifications: [],
        documentUrls: [],
        imageUrls: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'farm-003',
        operatorId: 'operator-003',
        name: 'Fayoum Tomato Cluster',
        country: 'Egypt',
        region: 'Fayoum',
        governorate: 'Fayoum',
        areaHectares: 18,
        soilType: 'loamy',
        waterSource: 'mixed',
        currentCrop: 'tomato',
        plannedCrops: ['tomato', 'potato'],
        requestedCapitalUsd: 65000,
        projectedRoiPercent: 22,
        cropCycleDays: 105,
        yieldHistory: [],
        certifications: [],
        documentUrls: [],
        imageUrls: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    if (!farmIds || farmIds.length === 0) {
      return farms;
    }

    const allowedFarmIds = new Set(farmIds);
    return farms.filter((farm) => allowedFarmIds.has(farm.id));
  }
}
