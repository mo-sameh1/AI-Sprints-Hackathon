-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "portfolio" TEXT[],

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorPreferences" (
    "investorId" TEXT NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "investmentHorizonMonths" INTEGER NOT NULL,
    "capitalBudgetUsd" DOUBLE PRECISION NOT NULL,
    "liquidityPreference" TEXT NOT NULL,
    "preferredCrops" TEXT[],
    "preferredRegions" TEXT[],
    "expectedRoiPercent" DOUBLE PRECISION NOT NULL,
    "sustainabilityFocus" BOOLEAN NOT NULL,

    CONSTRAINT "InvestorPreferences_pkey" PRIMARY KEY ("investorId")
);

-- CreateTable
CREATE TABLE "OperatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "region" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProfile" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "governorate" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "soilType" TEXT NOT NULL,
    "waterSource" TEXT NOT NULL,
    "currentCrop" TEXT NOT NULL,
    "plannedCrops" TEXT[],
    "requestedCapitalUsd" DOUBLE PRECISION NOT NULL,
    "projectedRoiPercent" DOUBLE PRECISION NOT NULL,
    "cropCycleDays" INTEGER NOT NULL,
    "yieldHistory" JSONB NOT NULL,
    "certifications" TEXT[],
    "documentUrls" TEXT[],
    "imageUrls" TEXT[],
    "status" TEXT NOT NULL,
    "aiProfileSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "riskFlags" JSONB NOT NULL,
    "horizonFitMonths" INTEGER NOT NULL,
    "estimatedRoiPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealRecommendation" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "structureType" TEXT NOT NULL,
    "recommendedInvestmentUsd" DOUBLE PRECISION NOT NULL,
    "projectedRoiPercent" DOUBLE PRECISION NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "terms" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "riskSummary" TEXT NOT NULL,
    "aiConfidence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSignal" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "affectedFarmIds" TEXT[],
    "affectedInvestorIds" TEXT[],
    "reasoning" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "actionRequired" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorReport" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "notes" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminReviewItem" (
    "id" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "flags" JSONB NOT NULL,
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorProfile_userId_key" ON "OperatorProfile"("userId");

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorPreferences" ADD CONSTRAINT "InvestorPreferences_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "InvestorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorProfile" ADD CONSTRAINT "OperatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmProfile" ADD CONSTRAINT "FarmProfile_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "OperatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "FarmProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "InvestorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealRecommendation" ADD CONSTRAINT "DealRecommendation_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "FarmProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealRecommendation" ADD CONSTRAINT "DealRecommendation_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "InvestorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorReport" ADD CONSTRAINT "OperatorReport_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "FarmProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
