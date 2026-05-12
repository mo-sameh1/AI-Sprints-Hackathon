import { Injectable } from '@nestjs/common';
import { WeatherForecast } from '@ai-sprints/shared-types';
import { fetchJson } from '../integration-http';

export interface WeatherForecastLocation {
  farmId: string;
  region: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface WeatherForecastQuery {
  farmIds?: string[];
  regions?: string[];
  locations?: WeatherForecastLocation[];
  horizonDays?: number;
}

export interface WeatherProviderResponse {
  provider: 'open-meteo';
  generatedAt: string;
  horizonDays: number;
  forecasts: WeatherForecast[];
}

interface OpenMeteoForecastResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    precipitation_sum?: number[];
    temperature_2m_max?: number[];
  };
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    name?: string;
  }>;
}

const DEFAULT_LOCATIONS: WeatherForecastLocation[] = [
  {
    farmId: 'farm-001',
    region: 'Delta',
    country: 'Egypt',
    latitude: 31.0409,
    longitude: 31.3785,
  },
  {
    farmId: 'farm-002',
    region: 'Upper Egypt',
    country: 'Egypt',
    latitude: 25.6872,
    longitude: 32.6396,
  },
  {
    farmId: 'farm-003',
    region: 'Fayoum',
    country: 'Egypt',
    latitude: 29.3084,
    longitude: 30.8428,
  },
];

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

@Injectable()
export class WeatherProvider {
  async fetchForecast(query: WeatherForecastQuery = {}): Promise<WeatherProviderResponse> {
    const horizonDays = Math.min(Math.max(query.horizonDays ?? 5, 1), 16);
    const locations = await this.resolveLocations(query);
    const forecasts = await Promise.all(
      locations.map((location) => this.fetchLocationForecast(location, horizonDays))
    );

    return {
      provider: 'open-meteo',
      generatedAt: new Date().toISOString(),
      horizonDays,
      forecasts,
    };
  }

  private async resolveLocations(query: WeatherForecastQuery): Promise<WeatherForecastLocation[]> {
    const farmIds = new Set(query.farmIds ?? []);
    const regions = new Set(query.regions ?? []);
    const candidates = query.locations?.length ? query.locations : DEFAULT_LOCATIONS;
    const filtered = candidates.filter((location) => {
      const farmMatch = farmIds.size === 0 || farmIds.has(location.farmId);
      const regionMatch = regions.size === 0 || regions.has(location.region);
      return farmMatch && regionMatch;
    });

    return Promise.all(filtered.map((location) => this.ensureCoordinates(location)));
  }

  private async ensureCoordinates(
    location: WeatherForecastLocation
  ): Promise<WeatherForecastLocation> {
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return location;
    }

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', `${location.region} ${location.country ?? 'Egypt'}`);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const data = await fetchJson<OpenMeteoGeocodingResponse>('open-meteo-geocoding', url);
    const result = data.results?.[0];
    if (!result) {
      throw new Error(`Open-Meteo could not geocode ${location.region}`);
    }

    return {
      ...location,
      country: result.country ?? location.country,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  }

  private async fetchLocationForecast(
    location: WeatherForecastLocation,
    horizonDays: number
  ): Promise<WeatherForecast> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(location.latitude));
    url.searchParams.set('longitude', String(location.longitude));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation,weather_code'
    );
    url.searchParams.set('daily', 'precipitation_sum,temperature_2m_max');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', String(horizonDays));

    const data = await fetchJson<OpenMeteoForecastResponse>('open-meteo-forecast', url);
    const precipitationSum = sum(data.daily?.precipitation_sum ?? []);
    const maxTemperature = max(data.daily?.temperature_2m_max ?? []);
    const temperature = data.current?.temperature_2m ?? maxTemperature ?? 0;
    const humidity = data.current?.relative_humidity_2m ?? 0;
    const weatherCode = data.current?.weather_code ?? 0;

    return {
      farmId: location.farmId,
      region: location.region,
      temperatureCelsius: roundOneDecimal(temperature),
      rainfallMm: roundOneDecimal(precipitationSum),
      humidity: Math.round(humidity),
      condition: WEATHER_CODE_LABELS[weatherCode] ?? `WMO weather code ${weatherCode}`,
      riskLevel: calculateWeatherRisk(precipitationSum, maxTemperature ?? temperature, humidity),
      forecastDate: data.current?.time ?? new Date().toISOString(),
    };
  }
}

function calculateWeatherRisk(
  precipitationMm: number,
  temperatureCelsius: number,
  humidity: number
): WeatherForecast['riskLevel'] {
  if (precipitationMm >= 50 || temperatureCelsius >= 42) {
    return 'high';
  }

  if (precipitationMm >= 20 || temperatureCelsius >= 38 || humidity >= 85) {
    return 'medium';
  }

  return 'low';
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

function max(values: number[]): number | undefined {
  const finite = values.filter(Number.isFinite);
  return finite.length ? Math.max(...finite) : undefined;
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
