import { Injectable } from '@nestjs/common';
import { GeospatialData } from '@ai-sprints/shared-types';

export interface GeospatialEnrichmentRequest {
  farmId: string;
  latitude?: number;
  longitude?: number;
  region?: string;
}

export interface GeospatialEnrichmentResponse {
  provider: 'mock-geospatial';
  generatedAt: string;
  data: GeospatialData;
  assumptions: string[];
}

@Injectable()
export class GeospatialProvider {
  enrichFarmLocation(request: GeospatialEnrichmentRequest): GeospatialEnrichmentResponse {
    const region = request.region ?? 'Unknown';
    const hasCoordinates =
      typeof request.latitude === 'number' && typeof request.longitude === 'number';

    return {
      provider: 'mock-geospatial',
      generatedAt: new Date().toISOString(),
      data: {
        farmId: request.farmId,
        ndviScore: region === 'Delta' ? 0.78 : 0.64,
        soilMoisturePercent: region === 'Fayoum' ? 32 : 46,
        elevationMeters: hasCoordinates ? Math.round(Math.abs(request.latitude ?? 0) * 3) : 24,
        nearestWaterBodyKm: region === 'Delta' ? 1.8 : 7.4,
        floodRiskScore: region === 'Delta' ? 7 : 3,
        droughtRiskScore: region === 'Fayoum' ? 8 : 4,
        updatedAt: new Date().toISOString(),
      },
      assumptions: [
        hasCoordinates
          ? 'Mock enrichment uses coordinates only for deterministic demo values.'
          : 'Coordinates were missing, so mock enrichment used regional defaults.',
        'Replace with satellite, parcel, or map providers before production use.',
      ],
    };
  }
}
