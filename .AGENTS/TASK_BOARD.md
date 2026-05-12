# Task Board

## Ready Now (Phase 2: Persistence & Integrations)

- [ ] initialize Prisma schema based on `shared-types`
- [ ] spin up local Postgres/Redis docker-compose
- [ ] migrate NestJS in-memory maps to Prisma repositories
- [ ] wire `ai-worker` to real OpenAI/HuggingFace APIs
- [ ] add JWT Auth for admin, operator, and investor roles
- [ ] replace weather/news mock providers with real alert APIs
- [ ] add WhatsApp webhook route for operator message intake

## Completed (Phase 2: Persistence & Integrations)

- [x] define integration provider contracts and local stubs for weather, news, geospatial, and WhatsApp

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
