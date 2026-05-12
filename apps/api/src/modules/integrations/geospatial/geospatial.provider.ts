import { Injectable } from '@nestjs/common';
import { GeospatialData } from '@ai-sprints/shared-types';
import { fetchJson } from '../integration-http';

export interface GeospatialEnrichmentRequest {
  farmId: string;
  latitude?: number;
  longitude?: number;
  region?: string;
}

export interface GeospatialEnrichmentResponse {
  provider: 'open-meteo';
  generatedAt: string;
  data: GeospatialData;
  assumptions: string[];
}

interface OpenMeteoElevationResponse {
  elevation?: number[];
}

interface OpenMeteoSoilResponse {
  hourly?: {
    soil_moisture_0_to_1cm?: number[];
  };
}

const REGION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  Delta: { latitude: 31.0409, longitude: 31.3785 },
  'Upper Egypt': { latitude: 25.6872, longitude: 32.6396 },
  Fayoum: { latitude: 29.3084, longitude: 30.8428 },
};

@Injectable()
export class GeospatialProvider {
  async enrichFarmLocation(
    request: GeospatialEnrichmentRequest
  ): Promise<GeospatialEnrichmentResponse> {
    const coordinates = this.resolveCoordinates(request);
    const [elevation, soilMoisturePercent] = await Promise.all([
      this.fetchElevationMeters(coordinates),
      this.fetchSoilMoisturePercent(coordinates),
    ]);

    const floodRiskScore = calculateFloodRisk(soilMoisturePercent, elevation);
    const droughtRiskScore = calculateDroughtRisk(soilMoisturePercent);

    return {
      provider: 'open-meteo',
      generatedAt: new Date().toISOString(),
      data: {
        farmId: request.farmId,
        ndviScore: estimateVegetationScore(soilMoisturePercent),
        soilMoisturePercent,
        elevationMeters: elevation,
        nearestWaterBodyKm: estimateNearestWaterBodyKm(request.region),
        floodRiskScore,
        droughtRiskScore,
        updatedAt: new Date().toISOString(),
      },
      assumptions: [
        'Elevation and soil moisture come from Open-Meteo APIs.',
        'NDVI is estimated from live soil moisture until a satellite vegetation provider is configured.',
        'Nearest water body distance is still a regional heuristic and should be replaced by a map provider.',
      ],
    };
  }

  private resolveCoordinates(request: GeospatialEnrichmentRequest): {
    latitude: number;
    longitude: number;
  } {
    if (typeof request.latitude === 'number' && typeof request.longitude === 'number') {
      return { latitude: request.latitude, longitude: request.longitude };
    }

    if (request.region && REGION_COORDINATES[request.region]) {
      return REGION_COORDINATES[request.region];
    }

    throw new Error(
      `Cannot enrich farm ${request.farmId}: latitude/longitude or a known region is required`
    );
  }

  private async fetchElevationMeters(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<number> {
    const url = new URL('https://api.open-meteo.com/v1/elevation');
    url.searchParams.set('latitude', String(coordinates.latitude));
    url.searchParams.set('longitude', String(coordinates.longitude));

    const data = await fetchJson<OpenMeteoElevationResponse>('open-meteo-elevation', url);
    return Math.round(data.elevation?.[0] ?? 0);
  }

  private async fetchSoilMoisturePercent(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<number> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(coordinates.latitude));
    url.searchParams.set('longitude', String(coordinates.longitude));
    url.searchParams.set('hourly', 'soil_moisture_0_to_1cm');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'auto');

    const data = await fetchJson<OpenMeteoSoilResponse>('open-meteo-soil', url);
    const readings = data.hourly?.soil_moisture_0_to_1cm ?? [];
    const latest = [...readings].reverse().find(Number.isFinite) ?? 0;
    return Math.round(latest * 100);
  }
}

function calculateFloodRisk(soilMoisturePercent: number, elevationMeters: number): number {
  const moistureComponent = soilMoisturePercent / 12;
  const elevationComponent = elevationMeters < 20 ? 2 : 0;
  return clampScore(Math.round(moistureComponent + elevationComponent));
}

function calculateDroughtRisk(soilMoisturePercent: number): number {
  return clampScore(Math.round((100 - soilMoisturePercent) / 10));
}

function estimateVegetationScore(soilMoisturePercent: number): number {
  return Math.min(1, Math.max(0, Math.round((soilMoisturePercent / 45) * 100) / 100));
}

function estimateNearestWaterBodyKm(region?: string): number {
  if (region === 'Delta') {
    return 2;
  }

  if (region === 'Upper Egypt') {
    return 3;
  }

  if (region === 'Fayoum') {
    return 7;
  }

  return 10;
}

function clampScore(value: number): number {
  return Math.min(10, Math.max(0, value));
}
