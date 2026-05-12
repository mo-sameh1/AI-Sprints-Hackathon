-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preferences" JSONB NOT NULL,
    "portfolio" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp_number" TEXT,
    "region" TEXT NOT NULL,
    "farm_ids" TEXT[],
    "verification_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_profiles" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "governorate" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "area_hectares" DOUBLE PRECISION NOT NULL,
    "soil_type" TEXT NOT NULL,
    "water_source" TEXT NOT NULL,
    "current_crop" TEXT NOT NULL,
    "planned_crops" TEXT[],
    "requested_capital_usd" DOUBLE PRECISION NOT NULL,
    "projected_roi_percent" DOUBLE PRECISION NOT NULL,
    "crop_cycle_days" INTEGER NOT NULL,
    "yield_history" JSONB NOT NULL,
    "certifications" TEXT[],
    "document_urls" TEXT[],
    "image_urls" TEXT[],
    "status" TEXT NOT NULL,
    "ai_profile_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "risk_flags" JSONB NOT NULL,
    "horizon_fit_months" INTEGER NOT NULL,
    "estimated_roi_percent" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_recommendations" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "structure_type" TEXT NOT NULL,
    "recommended_investment_usd" DOUBLE PRECISION NOT NULL,
    "projected_roi_percent" DOUBLE PRECISION NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "terms" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "risk_summary" TEXT NOT NULL,
    "ai_confidence" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_signals" (
    "id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "affected_farm_ids" TEXT[],
    "affected_investor_ids" TEXT[],
    "reasoning" TEXT NOT NULL,
    "source_url" TEXT,
    "action_required" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_reports" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "notes" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_review_items" (
    "id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ai_summary" TEXT NOT NULL,
    "flags" JSONB NOT NULL,
    "reviewed_by" TEXT,
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_review_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log_entries" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "farm_profiles_status_idx" ON "farm_profiles"("status");

-- CreateIndex
CREATE INDEX "farm_profiles_operator_id_idx" ON "farm_profiles"("operator_id");

-- CreateIndex
CREATE INDEX "match_results_investor_id_idx" ON "match_results"("investor_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_farm_id_investor_id_key" ON "match_results"("farm_id", "investor_id");

-- CreateIndex
CREATE INDEX "deal_recommendations_farm_id_idx" ON "deal_recommendations"("farm_id");

-- CreateIndex
CREATE INDEX "deal_recommendations_investor_id_idx" ON "deal_recommendations"("investor_id");

-- CreateIndex
CREATE INDEX "notification_signals_severity_idx" ON "notification_signals"("severity");

-- CreateIndex
CREATE INDEX "operator_reports_farm_id_idx" ON "operator_reports"("farm_id");

-- CreateIndex
CREATE INDEX "operator_reports_operator_id_idx" ON "operator_reports"("operator_id");

-- CreateIndex
CREATE INDEX "admin_review_items_status_idx" ON "admin_review_items"("status");

-- CreateIndex
CREATE INDEX "admin_review_items_item_type_idx" ON "admin_review_items"("item_type");

-- CreateIndex
CREATE INDEX "audit_log_entries_admin_id_idx" ON "audit_log_entries"("admin_id");

-- CreateIndex
CREATE INDEX "audit_log_entries_target_type_target_id_idx" ON "audit_log_entries"("target_type", "target_id");
