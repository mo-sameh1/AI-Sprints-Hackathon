import { Injectable } from '@nestjs/common';
import { WeatherForecast } from '@ai-sprints/shared-types';

export interface WeatherForecastQuery {
  farmIds?: string[];
  regions?: string[];
  horizonDays?: number;
}

export interface WeatherProviderResponse {
  provider: 'mock-weather';
  generatedAt: string;
  horizonDays: number;
  forecasts: WeatherForecast[];
}

const MOCK_FORECASTS: WeatherForecast[] = [
  {
    farmId: 'farm-001',
    region: 'Delta',
    temperatureCelsius: 38,
    rainfallMm: 95,
    humidity: 80,
    condition: 'Heavy thunderstorms',
    riskLevel: 'high',
    forecastDate: new Date().toISOString(),
  },
  {
    farmId: 'farm-003',
    region: 'Fayoum',
    temperatureCelsius: 42,
    rainfallMm: 5,
    humidity: 25,
    condition: 'Extreme heat',
    riskLevel: 'medium',
    forecastDate: new Date().toISOString(),
  },
];

@Injectable()
export class WeatherProvider {
  fetchForecast(query: WeatherForecastQuery = {}): WeatherProviderResponse {
    const farmIds = new Set(query.farmIds ?? []);
    const regions = new Set(query.regions ?? []);
    const forecasts = MOCK_FORECASTS.filter((forecast) => {
      const farmMatch = farmIds.size === 0 || farmIds.has(forecast.farmId);
      const regionMatch = regions.size === 0 || regions.has(forecast.region);
      return farmMatch && regionMatch;
    });

    return {
      provider: 'mock-weather',
      generatedAt: new Date().toISOString(),
      horizonDays: query.horizonDays ?? 5,
      forecasts,
    };
  }
}
