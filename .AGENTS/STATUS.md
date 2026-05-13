# Status

## Overall

Phase: `functional-in-memory-demo`

Confidence: `high on structure and demo completeness, ready for presentation or real backend integration`

## What Exists

- root monorepo config
- investor, operator, and admin app shells (Fully implemented frontends with Next.js running on ports 3003, 3005, and 3004 respectively)
- NestJS API shell (Fully implemented in-memory API with CORS enabled, running on port 4000)
- AI worker shell (Deterministic AI pipelines implemented)
- Full workspace build passes with `npm run build`.
- shared type package (Fully populated domain contracts)
- In-memory data stores for Farms, Investors, Matches, Deals, Reports, Notifications, and Admin Review items.
- Integration provider contracts for weather, news, geospatial, and WhatsApp.
- Open-Meteo-backed weather forecasts, geocoding, elevation, and soil moisture are wired in the API.
- GDELT-backed news ingestion is wired into notification alert reasoning with source URLs.
- Twilio WhatsApp outbound provider and inbound webhook endpoint are wired; real sends require Twilio env vars.
- Operator onboarding now captures photos, documents, and voice notes and includes processed media payloads in farm submissions.
- Operator reporting and submission status pages are implemented and wired to the existing in-memory API endpoints.

## What Is Not Done Yet

- actual Postgres/Redis database schema or migrations (currently in-memory)
- real auth (currently mock headers)
- real WhatsApp integration or inbound webhook controller
- real AI orchestration (currently deterministic pipelines simulating AI)
- configured Twilio credentials and public webhook URL for real WhatsApp runtime
- real satellite NDVI or map-based water proximity provider
- persistent object storage for operator-uploaded media (operator UI currently sends browser-processed data URLs through existing in-memory payload fields)

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

The next agent should focus on transitioning from the in-memory mock backend to a real persistent infrastructure:
1. ~~Implement Postgres with Prisma.~~ (Completed)
2. ~~Hook up real OpenAI/HuggingFace API calls in the `ai-worker`.~~ (Completed — gpt-4o-mini with deterministic fallback)
3. ~~Add actual JWT Auth.~~ (Completed — JWT strategy, guards, decorators in API; auth context + login page in investor-web)
4. Replace remaining integration stubs with vendor-backed HTTP clients after API keys and provider choices are finalized.

## Latest Investor Checkpoint

Date: 2026-05-13

- Added `apps/investor-web/src/lib/api.ts` — typed `apiFetch` with Bearer token injection and 401 redirect.
- Added `apps/investor-web/src/contexts/auth.context.tsx` — `AuthProvider` + `useAuth` hook; persists JWT in localStorage.
- Added `apps/investor-web/src/app/login/page.tsx` — login form pre-filled with demo creds (ahmed@investor.com / password123).
- Added `apps/investor-web/src/components/providers.tsx` — wraps layout with `AuthProvider`.
- Updated `apps/investor-web/src/app/layout.tsx` to include `Providers` wrapper.
- Updated `apps/investor-web/src/app/page.tsx` — nav shows authenticated user name + sign-out button.
- Updated preferences, opportunities, portfolio, and farm detail pages to use real auth and `apiFetch`.
- Added `@/*` path alias to `apps/investor-web/tsconfig.json`.
- Added `@nestjs/jwt ^11`, `@nestjs/passport ^11`, `passport`, `passport-jwt`, `bcryptjs` to API.
- Implemented `JwtStrategy`, `JwtAuthGuard` (dev-permissive when `JWT_SECRET` unset), `RolesGuard`, and auth decorators.
- Wired `gpt-4o-mini` in `ai-worker` with deterministic fallback when `OPENAI_API_KEY` absent.
- Added exponential-backoff retry to `integration-http.ts` (skip 4xx, retry 5xx/network).
- Added `health()` methods to weather, news, and geospatial providers; aggregated at `GET /integrations/health`.

## Latest Platform Checkpoint

Date: 2026-05-13

- Fully migrated all NestJS in-memory maps to Prisma repositories (Matches, Deals, Reports, Admin, Notifications, Farms, Investors).
- Injected `PrismaService` into all services and updated the core logic.
- Seeded initial demo data into the Postgres database.
- Fixed async controller issues across all modules.

## Latest Operator Checkpoint

Date: 2026-05-12

- Implemented operator upload handling in `apps/operator-web/src/app/onboard/page.tsx`.
- Added `apps/operator-web/src/app/reports/page.tsx` for yield/status/incident/financial reports.
- Added `apps/operator-web/src/app/status/page.tsx` for farm review tracking and media counts.
- Updated operator shared CSS for upload states, metrics, status pills, and mobile layouts.

## Local Runtime Checkpoint

Date: 2026-05-12

- Installed portable Node.js `v22.22.2` with npm `10.9.7` under repo-local `.tools/`.
- Ran `npm install` successfully; npm reported 2 moderate vulnerabilities and no automatic fix was applied.
- Operator production build passes with `npm run build -w @ai-sprints/operator-web`.
- API build passes with `npm run build -w @ai-sprints/api`.
- Removed the operator app's Google Font runtime fetch so offline builds do not fail on `next/font`.
- Updated the API dev script to `nest start --watch --entryFile apps/api/src/main` because the monorepo build emits the API entry under `dist/apps/api/src/main.js`.
- Verified API and operator routes in one runtime check: `/api/health`, `/api/farms`, `/`, `/onboard`, `/reports`, and `/status` all returned HTTP 200.
- Verified operator goal path by posting a farm with 1 image payload and 1 document payload, then posting an operator status report.
