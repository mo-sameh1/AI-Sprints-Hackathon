# Local Docker Infra

Use the root scripts so every agent starts the same local services:

```bash
npm run infra:up
npm run db:migrate
```

Services:

- Postgres 16 on `localhost:5432`
- Redis 7 on `localhost:6379`

Default API database URL:

```text
postgresql://postgres:postgres@localhost:5432/ai_sprints
```

Stop local services:

```bash
npm run infra:down
```
