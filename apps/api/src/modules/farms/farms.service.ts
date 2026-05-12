import { Injectable } from '@nestjs/common';
import { FarmProfile } from '@ai-sprints/shared-types';
import { buildFarmProfile } from '@ai-sprints/ai-worker';

// ── In-memory store ───────────────────────────────────────────────────────────
const farmStore = new Map<string, FarmProfile>();

// Seed with demo farms
const seedFarms: FarmProfile[] = [
  {
    id: 'farm-001',
    operatorId: 'op-001',
    name: 'Nile Delta Wheat Cooperative',
    country: 'Egypt',
    region: 'Delta',
    governorate: 'Beheira',
    latitude: 30.8481,
    longitude: 30.3436,
    areaHectares: 45,
    soilType: 'clay',
    waterSource: 'nile',
    currentCrop: 'wheat',
    plannedCrops: ['wheat', 'corn'],
    requestedCapitalUsd: 85000,
    projectedRoiPercent: 14,
    cropCycleDays: 120,
    yieldHistory: [
      { year: 2023, cropName: 'wheat', tonnesPerHectare: 4.2, revenueUsd: 72000 },
      { year: 2024, cropName: 'wheat', tonnesPerHectare: 4.5, revenueUsd: 78000 },
    ],
    certifications: ['GlobalG.A.P.'],
    documentUrls: [],
    imageUrls: [],
    status: 'active',
    aiProfileSummary: 'Established wheat cooperative with 2-year yield history and Nile irrigation access. Consistent yield growth of 7% year-over-year. Low operational risk.',
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'farm-002',
    operatorId: 'op-002',
    name: 'Upper Egypt Citrus Estate',
    country: 'Egypt',
    region: 'Upper Egypt',
    governorate: 'Luxor',
    latitude: 25.6872,
    longitude: 32.6396,
    areaHectares: 28,
    soilType: 'sandy',
    waterSource: 'groundwater',
    currentCrop: 'citrus',
    plannedCrops: ['citrus', 'mango'],
    requestedCapitalUsd: 120000,
    projectedRoiPercent: 19,
    cropCycleDays: 270,
    yieldHistory: [
      { year: 2024, cropName: 'citrus', tonnesPerHectare: 18, revenueUsd: 95000 },
    ],
    certifications: ['Organic Egypt', 'Fair Trade'],
    documentUrls: [],
    imageUrls: [],
    status: 'active',
    aiProfileSummary: 'Premium citrus estate in Luxor governorate with dual organic certifications. High ROI projection driven by export-grade fruit quality. Groundwater dependency is manageable at current depth.',
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2025-04-15T10:00:00Z',
  },
  {
    id: 'farm-003',
    operatorId: 'op-003',
    name: 'Fayoum Tomato & Potato Farm',
    country: 'Egypt',
    region: 'Fayoum',
    governorate: 'Fayoum',
    latitude: 29.3084,
    longitude: 30.8428,
    areaHectares: 15,
    soilType: 'loamy',
    waterSource: 'irrigation_canal',
    currentCrop: 'tomato',
    plannedCrops: ['tomato', 'potato', 'onion'],
    requestedCapitalUsd: 45000,
    projectedRoiPercent: 22,
    cropCycleDays: 90,
    yieldHistory: [
      { year: 2023, cropName: 'tomato', tonnesPerHectare: 35, revenueUsd: 42000 },
      { year: 2024, cropName: 'potato', tonnesPerHectare: 22, revenueUsd: 38000 },
    ],
    certifications: [],
    documentUrls: [],
    imageUrls: [],
    status: 'active',
    aiProfileSummary: 'High-yield vegetable farm in Fayoum oasis with irrigation canal access. Short 90-day crop cycles provide excellent capital velocity. Diversified crop rotation reduces single-crop risk.',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-05-01T08:00:00Z',
  },
  {
    id: 'farm-004',
    operatorId: 'op-004',
    name: 'Sinai Olive Grove Project',
    country: 'Egypt',
    region: 'Sinai',
    governorate: 'North Sinai',
    latitude: 30.9253,
    longitude: 33.7925,
    areaHectares: 60,
    soilType: 'chalky',
    waterSource: 'groundwater',
    currentCrop: 'olive',
    plannedCrops: ['olive'],
    requestedCapitalUsd: 200000,
    projectedRoiPercent: 16,
    cropCycleDays: 270,
    yieldHistory: [],
    certifications: ['Mediterranean Organic'],
    documentUrls: [],
    imageUrls: [],
    status: 'pending_review',
    aiProfileSummary: 'New olive cultivation project on reclaimed Sinai land. No yield history yet. Mediterranean organic certification adds export value. High capital requirement warrants thorough due diligence.',
    createdAt: '2025-05-05T11:00:00Z',
    updatedAt: '2025-05-05T11:00:00Z',
  },
  {
    id: 'farm-005',
    operatorId: 'op-005',
    name: 'Aswan Sugarcane Plantation',
    country: 'Egypt',
    region: 'Upper Egypt',
    governorate: 'Aswan',
    latitude: 24.0889,
    longitude: 32.8998,
    areaHectares: 80,
    soilType: 'clay',
    waterSource: 'nile',
    currentCrop: 'sugarcane',
    plannedCrops: ['sugarcane'],
    requestedCapitalUsd: 175000,
    projectedRoiPercent: 20,
    cropCycleDays: 365,
    yieldHistory: [
      { year: 2022, cropName: 'sugarcane', tonnesPerHectare: 75, revenueUsd: 130000 },
      { year: 2023, cropName: 'sugarcane', tonnesPerHectare: 80, revenueUsd: 142000 },
      { year: 2024, cropName: 'sugarcane', tonnesPerHectare: 82, revenueUsd: 148000 },
    ],
    certifications: ['GlobalG.A.P.', 'Rainforest Alliance'],
    documentUrls: [],
    imageUrls: [],
    status: 'active',
    aiProfileSummary: 'Mature sugarcane plantation with 3-year consistent growth trend. Nile irrigation and dual certifications support premium pricing. Long 365-day cycle requires patient capital with strong returns.',
    createdAt: '2024-11-01T07:00:00Z',
    updatedAt: '2025-04-01T07:00:00Z',
  },
];
seedFarms.forEach(f => farmStore.set(f.id, f));

@Injectable()
export class FarmsService {
  getAllFarms(): FarmProfile[] {
    return Array.from(farmStore.values());
  }

  getFarmById(id: string): FarmProfile | { error: string } {
    const farm = farmStore.get(id);
    if (!farm) return { error: `Farm ${id} not found` };
    return farm;
  }

  getActiveFarms(): FarmProfile[] {
    return Array.from(farmStore.values()).filter(f => f.status === 'active');
  }

  createFarm(raw: Record<string, unknown>, operatorId: string): FarmProfile {
    const farm = buildFarmProfile(raw, operatorId);
    farmStore.set(farm.id, farm);
    return farm;
  }

  updateFarmStatus(id: string, status: FarmProfile['status']): FarmProfile | { error: string } {
    const farm = farmStore.get(id);
    if (!farm) return { error: `Farm ${id} not found` };
    const updated = { ...farm, status, updatedAt: new Date().toISOString() };
    farmStore.set(id, updated);
    return updated;
  }
}
