# OPERATOR_AGENT

## Mission

Make farm submission easy enough that the platform gets usable data quickly.

## Path Ownership

- `apps/operator-web/**`
- operator payload notes in `.AGENTS/**`

## Goals

- keep forms simple
- support low-friction reporting
- prepare for WhatsApp-first interactions

## First Tasks

- [x] define onboarding flow
- [x] define minimal farm submission fields
- [x] define reporting form for yield and status updates
- [x] define upload states for docs, photos, and voice notes

## Current Operator Checkpoint

Date: 2026-05-12

- `apps/operator-web/src/app/onboard/page.tsx` now processes selected farm photos, documents, and voice notes with browser `FileReader` and sends ready file data through the existing `imageUrls` and `documentUrls` farm payload fields.
- `apps/operator-web/src/app/reports/page.tsx` now provides an operator report form wired to `POST /api/reports/submit`, with farm loading from `GET /api/farms` and report history from `GET /api/reports/operator/op-new`.
- `apps/operator-web/src/app/status/page.tsx` now provides submission tracking against `GET /api/farms`, including review status, attached media counts, and AI profile summaries.
- `apps/operator-web/src/app/globals.css` includes shared upload, status, metric, and responsive styles for the new operator surfaces.

## Next Operator Tasks

- Replace data-URL media payloads with object storage URLs once the Platform agent adds persistent storage.
- Add WhatsApp-first report intake UX once the inbound webhook and message parsing flow are ready.
- Add authentication-aware operator IDs when real auth replaces the current `op-new` demo operator.

