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

- add DTO files for investors, matches, and deals
- add repository interfaces
- add health and readiness endpoints
- define error shapes
- document API routes

## Do Not Block On

- visual design
- final AI provider choice

## Current Checkpoint

Date: 2026-05-13

- Fully migrated NestJS in-memory maps to Prisma repositories.
- Injected `PrismaService` into all services.
- Added `apps/api/src/modules/uploads/` with multer disk storage for media.
- Implemented `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`, and auth decorators.

## Next Tasks

- Define and implement database migration strategies for production.
- Refine error handling and reporting across Prisma boundaries.
