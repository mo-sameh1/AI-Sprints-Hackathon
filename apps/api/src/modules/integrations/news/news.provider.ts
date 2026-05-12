import { Injectable } from '@nestjs/common';
import { NewsSignal } from '@ai-sprints/shared-types';
import { createHash } from 'crypto';
import { fetchJson } from '../integration-http';

export interface NewsSignalQuery {
  crops?: string[];
  regions?: string[];
  since?: string;
  maxRecords?: number;
}

export interface NewsProviderResponse {
  provider: 'gdelt';
  generatedAt: string;
  query: string;
  signals: NewsSignal[];
}

interface GdeltArticleListResponse {
  articles?: GdeltArticle[];
}

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

const DEFAULT_CROPS = ['wheat', 'tomato', 'potato', 'citrus'];
const DEFAULT_REGIONS = ['Delta', 'Fayoum', 'Upper Egypt'];
const AGRICULTURE_TERMS = ['agriculture', 'farming', 'crop', 'irrigation'];

@Injectable()
export class NewsProvider {
  async fetchSignals(query: NewsSignalQuery = {}): Promise<NewsProviderResponse> {
    const gdeltQuery = buildGdeltQuery(query);
    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    url.searchParams.set('query', gdeltQuery);
    url.searchParams.set('mode', 'ArtList');
    url.searchParams.set('format', 'json');
    url.searchParams.set('maxrecords', String(Math.min(query.maxRecords ?? 20, 250)));
    url.searchParams.set('timespan', query.since ? toGdeltTimespan(query.since) : '7d');

    const data = await fetchJson<GdeltArticleListResponse>('gdelt-doc', url, 15000);

    return {
      provider: 'gdelt',
      generatedAt: new Date().toISOString(),
      query: gdeltQuery,
      signals: (data.articles ?? []).map((article) => mapArticleToSignal(article, query)),
    };
  }
}

function buildGdeltQuery(query: NewsSignalQuery): string {
  const crops = query.crops?.length ? query.crops : DEFAULT_CROPS;
  const regions = query.regions?.length ? query.regions : DEFAULT_REGIONS;
  const cropClause = `(${[...crops, ...AGRICULTURE_TERMS].join(' OR ')})`;
  const regionClause = `(Egypt OR ${regions.map((region) => `"${region}"`).join(' OR ')})`;
  return `${cropClause} ${regionClause}`;
}

function mapArticleToSignal(article: GdeltArticle, query: NewsSignalQuery): NewsSignal {
  const title = article.title.trim();
  const crops = findMentions(title, query.crops?.length ? query.crops : DEFAULT_CROPS);
  const regions = findMentions(title, query.regions?.length ? query.regions : DEFAULT_REGIONS);

  return {
    id: `gdelt-${hash(article.url)}`,
    headline: title,
    source: article.domain,
    relevance: classifyRelevance(title),
    sentiment: classifySentiment(title),
    affectedCrops: crops.length ? crops : query.crops?.length ? query.crops : DEFAULT_CROPS,
    affectedRegions: regions.length
      ? regions
      : query.regions?.length
        ? query.regions
        : DEFAULT_REGIONS,
    publishedAt: parseGdeltDate(article.seendate),
    sourceUrl: article.url,
  };
}

function classifyRelevance(headline: string): NewsSignal['relevance'] {
  const normalized = headline.toLowerCase();
  if (/\b(policy|minister|tariff|subsidy|regulation|government)\b/.test(normalized)) {
    return 'policy';
  }

  if (/\b(price|market|export|import|trade|supply|demand)\b/.test(normalized)) {
    return 'market';
  }

  if (/\b(climate|heat|rain|drought|flood|weather)\b/.test(normalized)) {
    return 'climate';
  }

  return 'agriculture';
}

function classifySentiment(headline: string): NewsSignal['sentiment'] {
  const normalized = headline.toLowerCase();
  if (/\b(drop|decline|drought|shortage|loss|risk|crisis|flood|heatwave)\b/.test(normalized)) {
    return 'negative';
  }

  if (/\b(growth|benefit|support|boost|investment|record|smart|improve)\b/.test(normalized)) {
    return 'positive';
  }

  return 'neutral';
}

function findMentions(text: string, candidates: string[]): string[] {
  const normalized = text.toLowerCase();
  return candidates.filter((candidate) => normalized.includes(candidate.toLowerCase()));
}

function parseGdeltDate(value: string): string {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  if (!match) {
    return new Date().toISOString();
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
}

function toGdeltTimespan(since: string): string {
  const sinceTime = new Date(since).getTime();
  if (!Number.isFinite(sinceTime)) {
    return '7d';
  }

  const diffMs = Math.max(Date.now() - sinceTime, 15 * 60 * 1000);
  const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return `${Math.ceil(diffHours / 24)}d`;
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 12);
}
