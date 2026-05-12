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
- News provider uses GDELT DOC article search for real agriculture/market/policy signals and carries source URLs through alert reasoning.
- WhatsApp provider uses Twilio Programmable Messaging for outbound WhatsApp sends when Twilio env vars are configured.
- WhatsApp inbound route is `POST /integrations/whatsapp/webhook` and can validate `X-Twilio-Signature` when `TWILIO_WEBHOOK_URL` is set.

## Local Development Stubs

- `WeatherProvider` uses Open-Meteo forecast/geocoding; no API key required for non-commercial use.
- `NewsProvider` uses GDELT DOC; no API key required.
- `GeospatialProvider` uses Open-Meteo elevation/soil moisture; no API key required for non-commercial use.
- `WhatsappProvider` uses Twilio. Required for real sends: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.
- For local inbound webhook testing, expose the API with ngrok and set `TWILIO_WEBHOOK_URL` to the public `/integrations/whatsapp/webhook` URL.

## Next Tasks

- add provider health checks and retry/error mapping
- choose a satellite/map provider for actual NDVI and water-body distance
