# Task Board

## Ready Now

- wire backend module DTOs and service contracts
- define shared domain types more deeply
- design the investor discovery pages
- design the operator onboarding flow
- draft the admin review queue UI
- define database tables and migration approach
- choose queue technology
- choose AI orchestration pattern

## Suggested Parallel Split

- `PLATFORM_AGENT`: backend module wiring and shared contracts
- `INVESTOR_AGENT`: investor web UX and API expectations
- `OPERATOR_AGENT`: operator onboarding/reporting UX and farm payloads
- `ADMIN_AGENT`: risk queue, overrides, and review states
- `AI_AGENT`: prompts, pipelines, job contracts, evaluation logic
- `INTEGRATIONS_AGENT`: providers, API mocks, env vars, failure modes

## Immediate Contract To Stabilize

- `InvestorPreferences`
- `FarmProfile`
- `MatchResult`
- `DealRecommendation`
- `NotificationSignal`
- `AdminReviewItem`

