import { FarmProfile, SoilType, WaterSource } from '@ai-sprints/shared-types';
import { callLlm } from '../providers/llm.provider';

/**
 * Builds a structured FarmProfile from raw operator submission data.
 * Infers missing fields, generates AI summary, normalizes values.
 */
export async function buildFarmProfile(
  raw: Record<string, unknown>,
  operatorId: string
): Promise<FarmProfile> {
  const id = `farm-${operatorId}-${Date.now()}`;

  const name = String(raw['name'] ?? 'Unnamed Farm');
  const region = String(raw['region'] ?? 'Unknown');
  const governorate = String(raw['governorate'] ?? region);
  const areaHectares = Number(raw['areaHectares'] ?? 1);
  const currentCrop = String(raw['currentCrop'] ?? 'wheat');
  const requestedCapitalUsd = Number(raw['requestedCapitalUsd'] ?? 10000);
  const waterSource = normalizeWaterSource(String(raw['waterSource'] ?? 'nile'));
  const soilType = normalizeSoilType(String(raw['soilType'] ?? 'loamy'));
  const plannedCrops = Array.isArray(raw['plannedCrops'])
    ? (raw['plannedCrops'] as string[])
    : [currentCrop];
  const certifications = Array.isArray(raw['certifications'])
    ? (raw['certifications'] as string[])
    : [];

  // Infer projected ROI from crop type and area
  const projectedRoiPercent = inferRoi(currentCrop, areaHectares, waterSource);
  const cropCycleDays = inferCropCycle(currentCrop);

  const profile: FarmProfile = {
    id,
    operatorId,
    name,
    country: String(raw['country'] ?? 'Egypt'),
    region,
    governorate,
    latitude: raw['latitude'] ? Number(raw['latitude']) : undefined,
    longitude: raw['longitude'] ? Number(raw['longitude']) : undefined,
    areaHectares,
    soilType,
    waterSource,
    currentCrop,
    plannedCrops,
    requestedCapitalUsd,
    projectedRoiPercent,
    cropCycleDays,
    yieldHistory: [],
    certifications,
    documentUrls: Array.isArray(raw['documentUrls']) ? (raw['documentUrls'] as string[]) : [],
    imageUrls: Array.isArray(raw['imageUrls']) ? (raw['imageUrls'] as string[]) : [],
    status: 'pending_review',
    aiProfileSummary: await buildAiSummary(name, region, currentCrop, areaHectares, projectedRoiPercent, waterSource, certifications),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return profile;
}

function inferRoi(crop: string, area: number, water: WaterSource): number {
  const baseRoi: Record<string, number> = {
    wheat: 12,
    corn: 15,
    rice: 13,
    cotton: 18,
    sugarcane: 20,
    tomato: 22,
    potato: 16,
    onion: 14,
    citrus: 19,
    mango: 21,
    grapes: 24,
    olive: 17,
  };
  const base = baseRoi[crop.toLowerCase()] ?? 14;
  const areaBonus = area > 50 ? 2 : area > 20 ? 1 : 0;
  const waterPenalty = water === 'rainwater' ? -3 : water === 'groundwater' ? -1 : 0;
  return +(base + areaBonus + waterPenalty).toFixed(1);
}

function inferCropCycle(crop: string): number {
  const cycles: Record<string, number> = {
    wheat: 120,
    corn: 90,
    rice: 150,
    cotton: 180,
    sugarcane: 365,
    tomato: 90,
    potato: 100,
    onion: 120,
    citrus: 270,
    mango: 365,
    grapes: 180,
    olive: 270,
  };
  return cycles[crop.toLowerCase()] ?? 120;
}

function normalizeWaterSource(raw: string): WaterSource {
  const map: Record<string, WaterSource> = {
    nile: 'nile',
    'nile river': 'nile',
    ground: 'groundwater',
    groundwater: 'groundwater',
    rain: 'rainwater',
    rainwater: 'rainwater',
    canal: 'irrigation_canal',
    'irrigation canal': 'irrigation_canal',
    mixed: 'mixed',
  };
  return map[raw.toLowerCase()] ?? 'nile';
}

function normalizeSoilType(raw: string): SoilType {
  const map: Record<string, SoilType> = {
    clay: 'clay',
    sandy: 'sandy',
    sand: 'sandy',
    loamy: 'loamy',
    loam: 'loamy',
    silt: 'silt',
    silty: 'silt',
    chalky: 'chalky',
    chalk: 'chalky',
    peaty: 'peaty',
    peat: 'peaty',
  };
  return map[raw.toLowerCase()] ?? 'loamy';
}

async function buildAiSummary(
  name: string,
  region: string,
  crop: string,
  area: number,
  roi: number,
  water: WaterSource,
  certifications: string[],
): Promise<string> {
  try {
    const result = await callLlm([
      {
        role: 'system',
        content:
          'You are an agricultural investment analyst. Write concise investor-facing farm profile summaries in 2-3 sentences. Focus on investability signals.',
      },
      {
        role: 'user',
        content:
          `Summarize this farm for potential investors:\n` +
          `Name: ${name}\nRegion: ${region}, Egypt\nCrop: ${crop}\nArea: ${area} hectares\n` +
          `Water source: ${water.replace('_', ' ')}\nProjected ROI: ${roi}%\n` +
          `Certifications: ${certifications.length ? certifications.join(', ') : 'none'}`,
      },
    ]);
    return result.content;
  } catch {
    // LLM unavailable — use deterministic summary so farm creation still succeeds
    return `${name} is a ${area}-hectare ${crop} farm in ${region}, Egypt. ` +
      `Water source: ${water.replace('_', ' ')}. Projected ROI: ${roi}%.` +
      (certifications.length ? ` Certifications: ${certifications.join(', ')}.` : '');
  }
}
