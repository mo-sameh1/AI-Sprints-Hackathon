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
- Weather provider uses Open-Meteo forecast and geocoding APIs with no local API key required for non-commercial use.
- Geospatial enrichment uses Open-Meteo elevation and soil moisture APIs.
- Geospatial NDVI and nearest-water-body fields are still derived heuristics until a satellite/map provider is selected.
- News provider still needs conversion from local stub to real article ingestion.
- WhatsApp provider defines send and inbound webhook parsing contracts, but no controller route is wired yet.

## Local Development Stubs

- `WeatherProvider` uses Open-Meteo forecast/geocoding; no API key required for non-commercial use.
- `NewsProvider` uses `mock-news`; no API key required.
- `GeospatialProvider` uses Open-Meteo elevation/soil moisture; no API key required for non-commercial use.
- `WhatsappProvider` uses `mock-whatsapp`; no Twilio credentials required.

## Next Tasks

- convert `NewsProvider` to GDELT DOC article ingestion
- add a WhatsApp webhook controller endpoint for inbound operator messages
- add provider health checks and retry/error mapping
- choose a satellite/map provider for actual NDVI and water-body distance
