# Task Board

## Ready Now (Phase 2: Persistence & Integrations)

- [ ] replace weather/news mock providers with real alert APIs
- [ ] add WhatsApp webhook route for operator message intake

## Completed (Phase 2: Persistence & Integrations)

- [x] wire `ai-worker` to real Google Gemini APIs (gemini-1.5-flash + deterministic fallback)
- [x] add JWT Auth for admin, operator, and investor roles (API guards + investor-web auth context)
- [x] admin-web real audit log from API + RBAC auth guard (JWT + x-role header)
- [x] add persistent object storage for operator-uploaded media (local disk via multer; Docker volume mount)
- [x] initialize Prisma schema based on `shared-types`
- [x] spin up local Postgres/Redis docker-compose (Or native Postgres)
- [x] migrate NestJS in-memory maps to Prisma repositories (Matches, Deals, Reports, Admin, Notifications, Farms, and Investors completed)

- [x] define integration provider contracts and local stubs for weather, news, geospatial, and WhatsApp
- [x] wire Open-Meteo live weather forecast, geocoding, elevation, and soil moisture calls
- [x] wire GDELT DOC live news article ingestion into alert reasoning
- [x] wire Twilio WhatsApp outbound client and inbound webhook parsing/signature validation
- [x] unblock full workspace production build
- [x] implement operator-side farm photo, document, and voice-note upload processing
- [x] implement operator reporting form wired to the Reports API
- [x] implement operator submission status tracking wired to the Farms API
- [x] install local Node/npm runtime and verify operator/API build and runtime routes

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
