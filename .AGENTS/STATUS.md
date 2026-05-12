# Status

## Overall

Phase: `persistence-integration`

Confidence: `high on API persistence path, still needs local infra automation and auth`

## What Exists

- root monorepo config
- investor, operator, and admin app shells (Fully implemented frontends with Next.js running on ports 3003, 3005, and 3004 respectively)
- NestJS API shell with Prisma-backed repositories, CORS enabled, and health/readiness endpoints
- AI worker shell (Deterministic AI pipelines implemented)
- Full workspace build passes with `npm run build`.
- shared type package (Fully populated domain contracts)
- Prisma/Postgres repositories for Farms, Investors, Matches, Deals, Reports, Notifications, Operators, and Admin Review items.
- Initial Prisma schema and migration under `apps/api/prisma`.
- API seed data loader for demo farms, investors, operators, and admin review queue items.
- Integration provider contracts for weather, news, geospatial, and WhatsApp.
- Open-Meteo-backed weather forecasts, geocoding, elevation, and soil moisture are wired in the API.
- GDELT-backed news ingestion is wired into notification alert reasoning with source URLs.
- Twilio WhatsApp outbound provider and inbound webhook endpoint are wired; real sends require Twilio env vars.

## What Is Not Done Yet

- docker-compose or scripted startup for local Postgres/Redis
- real auth (currently mock headers)
- real AI orchestration (currently deterministic pipelines simulating AI)
- configured Twilio credentials and public webhook URL for real WhatsApp runtime
- real satellite NDVI or map-based water proximity provider

## Priority Order (Completed for MVP)

1. ~~investor discovery and matching flow~~ (Done)
2. ~~deal structure recommendation flow~~ (Done)
3. ~~operator onboarding and farm profile ingestion~~ (Done)
4. ~~alerting and WhatsApp delivery~~ (Done)
5. ~~admin review queue~~ (Done)

## Definition Of A Good First Demo (Completed)

- ~~operator submits a farm profile~~
- ~~backend stores a structured record~~
- ~~investor submits preferences~~
- ~~system returns ranked farm matches~~
- ~~system returns a suggested deal structure~~
- ~~admin can view the recommendation and any flags~~

## Next Phase

The next agent should focus on completing production-grade infrastructure around the new persistent API:
1. Add docker-compose and setup scripts for local Postgres/Redis.
2. Hook up real OpenAI/HuggingFace API calls in the `ai-worker`.
3. Add actual JWT Auth.
4. Replace remaining integration stubs with vendor-backed HTTP clients after API keys and provider choices are finalized.
