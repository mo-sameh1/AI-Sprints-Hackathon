import { Injectable } from '@nestjs/common';
import {
  FarmProfile,
  NewsSignal,
  NotificationSignal,
  WeatherForecast,
} from '@ai-sprints/shared-types';
import { reasonAboutAlerts } from '@ai-sprints/ai-worker';
import { FarmsService } from '../farms/farms.service';
import { notFoundError } from '../../common/http.types';
import { NewsProvider } from '../integrations/news/news.provider';
import { WeatherProvider } from '../integrations/weather/weather.provider';
import { NotificationsRepository } from '../database/repositories/platform.repositories';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly weatherProvider: WeatherProvider,
    private readonly newsProvider: NewsProvider,
    private readonly farmsService: FarmsService,
    private readonly notificationsRepository: NotificationsRepository
  ) {
    void this.evaluateSignals().catch((error) => {
      console.warn('Initial notification signal evaluation failed', error);
    });
  }

  async evaluateSignals(
    payload: {
      weatherForecasts?: WeatherForecast[];
      newsSignals?: NewsSignal[];
      farmIds?: string[];
    } = {}
  ): Promise<NotificationSignal[]> {
    const farms = await this.getFarms(payload.farmIds);
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
    return this.notificationsRepository.saveMany(signals);
  }

  getAllSignals(): Promise<NotificationSignal[]> {
    return this.notificationsRepository.findAll();
  }

  async getSignalById(id: string) {
    const signal = await this.notificationsRepository.findById(id);
    return signal ?? notFoundError('Signal', id);
  }

  getSignalsForFarm(farmId: string): Promise<NotificationSignal[]> {
    return this.notificationsRepository.findForFarm(farmId);
  }

  private async getFarms(farmIds?: string[]): Promise<FarmProfile[]> {
    const farms = await this.farmsService.getAllFarms();
    if (!farmIds || farmIds.length === 0) {
      return farms;
    }

    const allowedFarmIds = new Set(farmIds);
    return farms.filter((farm) => allowedFarmIds.has(farm.id));
  }
}
