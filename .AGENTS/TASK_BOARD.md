# Task Board

## Ready Now (Phase 2: Persistence & Integrations)

- [x] initialize Prisma schema based on `shared-types`
- [ ] spin up local Postgres/Redis docker-compose
- [x] migrate NestJS in-memory maps to Prisma repositories
- [ ] wire `ai-worker` to real OpenAI/HuggingFace APIs
- [ ] add JWT Auth for admin, operator, and investor roles
- [ ] replace weather/news mock providers with real alert APIs
- [ ] add WhatsApp webhook route for operator message intake

## Completed (Phase 2: Persistence & Integrations)

- [x] add Prisma schema, initial migration, and Prisma client generation scripts for the API
- [x] add API readiness check backed by a Postgres query
- [x] replace API in-memory collections with Prisma-backed repositories and seed data
- [x] define integration provider contracts and local stubs for weather, news, geospatial, and WhatsApp
- [x] wire Open-Meteo live weather forecast, geocoding, elevation, and soil moisture calls
- [x] wire GDELT DOC live news article ingestion into alert reasoning
- [x] wire Twilio WhatsApp outbound client and inbound webhook parsing/signature validation
- [x] unblock full workspace production build

## Completed (Phase 1: In-Memory Demo)

- [x] wire backend module DTOs and service contracts
- [x] define shared domain types deeply
- [x] design the investor discovery pages
- [x] design the operator onboarding flow
- [x] draft the admin review queue UI
- [x] implement in-memory mock backend logic
- [x] implement deterministic mock AI logic

## Suggested Parallel Split for Phase 2

- `PLATFORM_AGENT`: Prisma schema, migrations, repository refactoring
- `INVESTOR_AGENT`: Connect Investor UX to real Auth and handle error states
- `OPERATOR_AGENT`: Handle real image uploads and document processing for farms
- `ADMIN_AGENT`: Implement real audit trails and role-based access control
- `AI_AGENT`: Replace mock logic with LangChain/OpenAI calls, handle rate limits and prompt engineering
- `INTEGRATIONS_AGENT`: Setup third-party APIs (Weather, News, WhatsApp Twilio)

## Stable Contracts (Source of Truth)

- `InvestorPreferences`
- `FarmProfile`
- `MatchResult`
- `DealRecommendation`
- `NotificationSignal`
- `AdminReviewItem`
