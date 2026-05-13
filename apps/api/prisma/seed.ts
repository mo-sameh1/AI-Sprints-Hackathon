import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  // 1. Create a dummy operator and investor user
  const opUser = await prisma.user.upsert({
    where: { email: 'op-001@example.com' },
    update: {},
    create: {
      id: 'op-001',
      email: 'op-001@example.com',
      name: 'Demo Operator',
      role: 'operator',
    },
  });

  const invUser = await prisma.user.upsert({
    where: { id: 'user-001' },
    update: {
      email: 'investor@example.com',
      name: 'Ahmed Mansour',
      role: 'investor',
    },
    create: {
      id: 'user-001',
      email: 'investor@example.com',
      name: 'Ahmed Mansour',
      role: 'investor',
    },
  });

  // 2. Create the OperatorProfile
  await prisma.operatorProfile.upsert({
    where: { userId: 'op-001' },
    update: {},
    create: {
      id: 'op-001',
      userId: 'op-001',
      name: 'Demo Operator',
      phone: '+1234567890',
      region: 'Delta',
      verificationStatus: 'verified',
    },
  });

  // 3. Create the InvestorProfile and Preferences
  await prisma.investorProfile.upsert({
    where: { id: 'inv-001' },
    update: {},
    create: {
      id: 'inv-001',
      userId: 'user-001',
      name: 'Ahmed Mansour',
      portfolio: [],
      preferences: {
        create: {
          riskTolerance: 'medium',
          investmentHorizonMonths: 12,
          capitalBudgetUsd: 100000,
          liquidityPreference: 'medium',
          preferredCrops: ['wheat', 'citrus', 'tomato'],
          preferredRegions: ['Delta', 'Fayoum'],
          expectedRoiPercent: 15,
          sustainabilityFocus: true,
        }
      }
    },
  });

  // 4. Seed Farms
  const seedFarms = [
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
      createdAt: new Date('2025-01-15T09:00:00Z'),
      updatedAt: new Date('2025-03-01T09:00:00Z'),
    },
    {
      id: 'farm-002',
      operatorId: 'op-001', // Reused op-001 for all seed farms to avoid creating 5 operator profiles
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
      createdAt: new Date('2025-02-10T10:00:00Z'),
      updatedAt: new Date('2025-04-15T10:00:00Z'),
    },
    {
      id: 'farm-003',
      operatorId: 'op-001',
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
      createdAt: new Date('2025-03-01T08:00:00Z'),
      updatedAt: new Date('2025-05-01T08:00:00Z'),
    },
    {
      id: 'farm-004',
      operatorId: 'op-001',
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
      createdAt: new Date('2025-05-05T11:00:00Z'),
      updatedAt: new Date('2025-05-05T11:00:00Z'),
    },
    {
      id: 'farm-005',
      operatorId: 'op-001',
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
      createdAt: new Date('2024-11-01T07:00:00Z'),
      updatedAt: new Date('2025-04-01T07:00:00Z'),
    },
  ];

  for (const farm of seedFarms) {
    await prisma.farmProfile.upsert({
      where: { id: farm.id },
      update: {},
      create: {
        ...farm,
        yieldHistory: farm.yieldHistory as any
      },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
