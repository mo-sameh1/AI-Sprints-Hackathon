# INTEGRATIONS_AGENT

## Mission

Own the external-system edge.

## Path Ownership

- `apps/api/src/modules/integrations/**`
- `infra/docker/**`
- environment notes in `.AGENTS/**`

## Goals

- define provider interfaces
- mock external APIs early
- keep secrets out of source files
- document reliability assumptions

## First Tasks

- [x] define weather provider response shape
- [x] define news provider response shape
- [x] define geospatial enrichment response shape
- [x] define WhatsApp send and receive contracts
- [x] document local development stubs

## Current Integration Checkpoint

Date: 2026-05-12

- Provider abstractions live under `apps/api/src/modules/integrations/**`.
- `IntegrationsModule` exports weather, news, geospatial, and WhatsApp providers for Nest modules.
- Weather and news providers return deterministic mock responses used by `NotificationsService`.
- Geospatial enrichment returns deterministic mock NDVI, water, flood, and drought fields from farm location context.
- WhatsApp provider defines send and inbound webhook parsing contracts, but no controller route is wired yet.

## Local Development Stubs

- `WeatherProvider` uses `mock-weather`; no API key required.
- `NewsProvider` uses `mock-news`; no API key required.
- `GeospatialProvider` uses `mock-geospatial`; no API key required.
- `WhatsappProvider` uses `mock-whatsapp`; no Twilio credentials required.

## Next Tasks

- add environment variable names for real providers once vendors are selected
- add a WhatsApp webhook controller endpoint for inbound operator messages
- add provider health checks and retry/error mapping
- replace deterministic mock data with HTTP clients behind the same provider contracts
