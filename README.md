# AI Sprints Hackathon

Investor-first scaffold for an AI-powered agricultural investing platform with three personas:

- investors
- farm operators
- administrators

## Repo Shape

- `apps/api`: core platform API with domain modules, controllers, and service shells
- `apps/ai-worker`: AI pipelines for profile building, matching, deal recommendation, and alert reasoning
- `apps/investor-web`: highest-priority user experience for opportunity discovery and portfolio insight
- `apps/operator-web`: operator onboarding, reporting, and notification surfaces
- `apps/admin-web`: admin review, alert triage, and decision oversight
- `packages/shared-types`: shared domain contracts
- `packages/sdk`: future typed client for frontend-to-backend communication
- `packages/ui`: shared UI system shell
- `infra`: local infra notes and docker compose
- `.AGENTS`: project decisions, status, workstream ownership, and agent handoff notes

## Current Status

This repo is intentionally scaffolded, not fully wired. It is ready for a team to parallelize work with agents across frontend, backend, AI, and integrations.

Read `.AGENTS/README.md` first.

