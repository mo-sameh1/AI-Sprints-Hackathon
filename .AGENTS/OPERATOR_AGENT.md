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

Date: 2026-05-13

- `apps/operator-web/src/app/onboard/page.tsx` now posts files to `POST /api/uploads` and uses real object storage URLs (local disk via multer) instead of data URLs.
- `apps/operator-web/src/app/reports/page.tsx` provides an operator report form wired to real backend endpoints.
- `apps/operator-web/src/app/status/page.tsx` provides submission tracking against real API endpoints.
- `apps/operator-web/src/app/globals.css` includes shared upload, status, metric, and responsive styles.
- Authentication integration is prepared; pending real auth contexts replacing demo operator IDs.

## Next Operator Tasks

- Add WhatsApp-first report intake UX once the inbound webhook and message parsing flow are ready.
- Fully wire authentication-aware operator IDs for report submissions.

