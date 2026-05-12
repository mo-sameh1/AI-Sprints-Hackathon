# Schema Overview

The API now uses Prisma for the first persistent schema. Source of truth:

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260512220000_initial_persistence/migration.sql`

Core models implemented:

- `User`
- `InvestorProfile`
- `OperatorProfile`
- `FarmProfile`
- `MatchResult`
- `DealRecommendation`
- `NotificationSignal`
- `OperatorReport`
- `AdminReviewItem`
- `AuditLogEntry`

Follow-up infrastructure still needed:

- local `docker-compose` for Postgres and Redis
- relation constraints once auth/user lifecycle is finalized
- document/media storage tables after upload provider selection

