# API

NestJS modular backend with Prisma-backed persistence.

## Local Commands

- `npm run prisma:generate -w @ai-sprints/api`
- `npm run prisma:migrate -w @ai-sprints/api`
- `npm run build -w @ai-sprints/api`
- `npm run dev -w @ai-sprints/api`

Default database URL:

`postgresql://postgres:postgres@localhost:5432/ai_sprints`

Override with `DATABASE_URL`.

## Core Routes

- `GET /api/health`
- `GET /api/ready`
- `GET /api/farms`
- `GET /api/farms/active`
- `POST /api/farms`
- `PATCH /api/farms/:id/status`
- `GET /api/investors`
- `POST /api/investors/preferences`
- `POST /api/matches/rank`
- `POST /api/deals/recommend`
- `GET /api/notifications`
- `POST /api/notifications/evaluate`
- `POST /api/reports/submit`
- `GET /api/admin/stats`
- `GET /api/admin/queue`
- `POST /api/admin/queue/:id/review`

