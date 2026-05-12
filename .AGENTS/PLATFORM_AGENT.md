# PLATFORM_AGENT

## Mission

Own the core backend scaffold and shared contracts.

## Path Ownership

- `apps/api/**`
- `packages/shared-types/**`
- `packages/sdk/**`
- `infra/db/**`

## Goals

- make module boundaries explicit
- define DTOs and API contracts
- choose schema and migration strategy
- keep investor-critical endpoints stable first

## First Tasks

- [x] add DTO files for investors, matches, and deals
- [x] add repository interfaces
- [x] add health and readiness endpoints
- [x] define error shapes
- [x] document API routes

## Current Platform Checkpoint

Date: 2026-05-13

- Prisma/Postgres is the API persistence strategy.
- Initial schema and migration live under `apps/api/prisma`.
- `PrismaService`, seed loading, mappers, and repository classes live under `apps/api/src/modules/database`.
- DTO files now exist for investor preferences, match ranking, and deal recommendation.
- API errors use the structured shape in `apps/api/src/common/http.types.ts` while preserving the legacy `error` field.
- Local infra can be started with `npm run infra:up`, migrated with `npm run db:migrate`, and stopped with `npm run infra:down`.
- API route documentation lives in `apps/api/README.md`.

## Next Platform Tasks

- add real JWT auth and role enforcement around persisted users
- add relational constraints after auth/user lifecycle is finalized
- split any large repository classes only if module growth makes it useful
- add automated integration tests against Postgres

## Do Not Block On

- visual design
- final AI provider choice

