import { Injectable, Logger } from '@nestjs/common';
import {
  FarmProfile,
  NewsSignal,
  NotificationSignal,
  WeatherForecast,
} from '@ai-sprints/shared-types';
import { reasonAboutAlerts } from '@ai-sprints/ai-worker';
import { NewsProvider } from '../integrations/news/news.provider';
import { WeatherProvider } from '../integrations/weather/weather.provider';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly weatherProvider: WeatherProvider,
    private readonly newsProvider: NewsProvider,
    private readonly prisma: PrismaService
  ) {
    // Delay initial evaluation to allow DB connection to establish
    setTimeout(() => {
      void this.evaluateSignals().catch((error) => {
        this.logger.warn('Initial notification signal evaluation failed', error);
      });
    }, 3000);
  }

  async evaluateSignals(
    payload: {
      weatherForecasts?: WeatherForecast[];
      newsSignals?: NewsSignal[];
      farmIds?: string[];
    } = {}
  ): Promise<NotificationSignal[]> {
    const farms = await this.loadFarms(payload.farmIds);
    if (farms.length === 0) {
      this.logger.warn('No farms found for notification evaluation');
      return [];
    }

    const weatherForecasts =
      payload.weatherForecasts ??
      (
        await this.weatherProvider.fetchForecast({
          farmIds: payload.farmIds,
          locations: farms.map((farm) => ({
            farmId: farm.id,
            region: farm.region,
            country: farm.country,
            latitude: farm.latitude,
            longitude: farm.longitude,
          })),
        })
      ).forecasts;
    const newsSignals =
      payload.newsSignals ??
      (
        await this.newsProvider.fetchSignals({
          crops: [...new Set(farms.map((farm) => farm.currentCrop))],
          regions: [...new Set(farms.map((farm) => farm.region))],
        })
      ).signals;

    const signals = reasonAboutAlerts(farms, weatherForecasts, newsSignals);
    
    // Save to DB
    if (signals.length > 0) {
      await this.prisma.notificationSignal.createMany({
        data: signals.map(signal => ({
          id: signal.id,
          alertType: signal.alertType,
          severity: signal.severity,
          title: signal.title,
          summary: signal.summary,
          affectedFarmIds: signal.affectedFarmIds,
          affectedInvestorIds: signal.affectedInvestorIds,
          reasoning: signal.reasoning,
          sourceUrl: signal.sourceUrl,
          actionRequired: signal.actionRequired,
          createdAt: new Date(signal.createdAt)
        })),
        skipDuplicates: true,
      });
    }
    
    return signals;
  }

  async getAllSignals(): Promise<NotificationSignal[]> {
    const signals = await this.prisma.notificationSignal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return signals.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString()
    })) as NotificationSignal[];
  }

  async getSignalById(id: string): Promise<NotificationSignal | { error: string }> {
    const signal = await this.prisma.notificationSignal.findUnique({
      where: { id }
    });
    
    if (!signal) {
      return { error: `Signal ${id} not found` };
    }
    
    return {
      ...signal,
      createdAt: signal.createdAt.toISOString()
    } as NotificationSignal;
  }

  async getSignalsForFarm(farmId: string): Promise<NotificationSignal[]> {
    const signals = await this.prisma.notificationSignal.findMany({
      where: {
        affectedFarmIds: {
          has: farmId
        }
      }
    });
    
    return signals.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString()
    })) as NotificationSignal[];
  }

  /**
   * Load farms from the Prisma database. Falls back to hardcoded demo data
   * when the database is empty or unavailable.
   */
  private async loadFarms(farmIds?: string[]): Promise<FarmProfile[]> {
    try {
      const where: Record<string, unknown> = { status: 'active' };
      if (farmIds && farmIds.length > 0) {
        where['id'] = { in: farmIds };
      }
      const dbFarms = await this.prisma.farmProfile.findMany({ where });
      if (dbFarms.length > 0) {
        return dbFarms.map(f => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
          yieldHistory: f.yieldHistory as any,
        })) as FarmProfile[];
      }
    } catch (err) {
      this.logger.warn('Could not load farms from DB, using demo fallback', err);
    }

    return this.getDemoFarmsFallback(farmIds);
  }

  /** Hardcoded demo farms used only when the database is empty or unreachable. */
  private getDemoFarmsFallback(farmIds?: string[]): FarmProfile[] {
    const farms: FarmProfile[] = [
      {
        id: 'farm-001',
        operatorId: 'operator-001',
        name: 'Delta Wheat Cooperative',
        country: 'Egypt',
        region: 'Delta',
        governorate: 'Dakahlia',
        latitude: 31.0409,
        longitude: 31.3785,
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
        latitude: 25.6872,
        longitude: 32.6396,
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
        latitude: 29.3084,
        longitude: 30.8428,
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
