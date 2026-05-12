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

