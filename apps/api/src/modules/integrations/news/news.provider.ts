import { Injectable } from '@nestjs/common';
import { NewsSignal } from '@ai-sprints/shared-types';

export interface NewsSignalQuery {
  crops?: string[];
  regions?: string[];
  since?: string;
}

export interface NewsProviderResponse {
  provider: 'mock-news';
  generatedAt: string;
  signals: NewsSignal[];
}

const MOCK_SIGNALS: NewsSignal[] = [
  {
    id: 'news-001',
    headline: 'Egypt raises wheat import tariffs; domestic producers benefit',
    source: 'AlAhram Business',
    relevance: 'policy',
    sentiment: 'positive',
    affectedCrops: ['wheat'],
    affectedRegions: ['Delta', 'Upper Egypt'],
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'news-002',
    headline: 'Tomato prices drop 18% amid regional oversupply',
    source: 'AgriMarket Egypt',
    relevance: 'market',
    sentiment: 'negative',
    affectedCrops: ['tomato', 'potato'],
    affectedRegions: ['Fayoum'],
    publishedAt: new Date().toISOString(),
  },
];

@Injectable()
export class NewsProvider {
  fetchSignals(query: NewsSignalQuery = {}): NewsProviderResponse {
    const crops = new Set(query.crops ?? []);
    const regions = new Set(query.regions ?? []);
    const sinceTime = query.since ? new Date(query.since).getTime() : undefined;

    const signals = MOCK_SIGNALS.filter((signal) => {
      const cropMatch =
        crops.size === 0 || signal.affectedCrops.some((crop) => crops.has(crop));
      const regionMatch =
        regions.size === 0 ||
        signal.affectedRegions.some((region) => regions.has(region));
      const timeMatch =
        sinceTime === undefined || new Date(signal.publishedAt).getTime() >= sinceTime;

      return cropMatch && regionMatch && timeMatch;
    });

    return {
      provider: 'mock-news',
      generatedAt: new Date().toISOString(),
      signals,
    };
  }
}
