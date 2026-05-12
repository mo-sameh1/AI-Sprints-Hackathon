# API

NestJS modular backend with Prisma-backed persistence.

## Local Commands

- `npm run infra:up`
- `npm run prisma:generate -w @ai-sprints/api`
- `npm run prisma:deploy -w @ai-sprints/api`
- `npm run build -w @ai-sprints/api`
- `npm run dev -w @ai-sprints/api`

Default database URL:

`postgresql://postgres:postgres@localhost:5432/ai_sprints`

Override with `DATABASE_URL`.

## Error Shape

Error responses keep the legacy `error` field and add a stable machine-readable envelope:

```json
{
  "error": "Farm farm-123 not found",
  "code": "NOT_FOUND",
  "message": "Farm farm-123 not found",
  "statusCode": 404,
  "timestamp": "2026-05-13T00:00:00.000Z",
  "details": { "resource": "Farm", "id": "farm-123" }
}
```

## Core Routes

### Platform

- `GET /api/health` - process-level health check.
- `GET /api/ready` - readiness check backed by a Postgres query.

### Farms

- `GET /api/farms` - list all persisted farms.
- `GET /api/farms/active` - list active farms for discovery and matching.
- `GET /api/farms/:id` - fetch one farm or a structured `NOT_FOUND` error.
- `POST /api/farms` - create a farm profile from raw operator intake.
- `PATCH /api/farms/:id/status` - update a farm status.

### Investors

- `GET /api/investors/preferences-template` - preference form metadata.
- `GET /api/investors` - list investor profiles.
- `GET /api/investors/:id` - fetch one investor or a structured `NOT_FOUND` error.
- `POST /api/investors/preferences` - save `SaveInvestorPreferencesDto`.
- `POST /api/investors/:id/portfolio` - add a farm ID to the investor watchlist.

### Matches

- `POST /api/matches/rank` - rank farms for `RankMatchesDto` or existing investor preferences.
- `GET /api/matches/:investorId` - fetch last persisted match results.

### Deals

- `POST /api/deals/recommend` - recommend a deal from `RecommendDealDto`.
- `GET /api/deals/investor/:investorId` - list investor deal recommendations.
- `GET /api/deals/farm/:farmId` - list farm deal recommendations.
- `GET /api/deals/:id` - fetch one deal recommendation.

### Notifications

- `GET /api/notifications` - list alert signals.
- `GET /api/notifications/farm/:farmId` - list signals affecting a farm.
- `GET /api/notifications/:id` - fetch one signal.
- `POST /api/notifications/evaluate` - evaluate weather/news signals and persist generated alerts.

### Reports

- `POST /api/reports/submit` - submit an operator report.
- `GET /api/reports/farm/:farmId` - list reports for a farm.
- `GET /api/reports/operator/:operatorId` - list reports for an operator.

### Admin

- `GET /api/admin/stats` - review queue counts.
- `GET /api/admin/queue?status=pending` - list review items.
- `GET /api/admin/queue/:id` - fetch one review item.
- `POST /api/admin/queue/:id/review` - approve, reject, override, or escalate a review item.
- `GET /api/admin/audit` - list audit log entries.

