# Deployment

## Full Local Stack With Docker Compose

This repository includes three web apps, one API, Postgres, and Redis. Start the whole local stack from the repository root:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

Services exposed on the host:

- Investor entry: `http://localhost:3000`
- Admin app: `http://localhost:3001`
- Operator app: `http://localhost:3002`
- API: `http://localhost:4100/api`
- Postgres: `localhost:5433`
- Redis: `localhost:6379`

The API container listens on `4000` internally and is published to host port `4100` so it does not collide with local tools that may already use `4000`.

Runtime secrets are loaded from `.env` and `apps/api/.env`; they are intentionally excluded from the Docker image by `.dockerignore`.

## Vercel

Vercel does not run Docker Compose or arbitrary Docker containers as an application runtime. Deploy the three Next.js apps as three Vercel projects from the same monorepo:

- `apps/investor-web`
- `apps/admin-web`
- `apps/operator-web`

Each app has a `vercel.json` with monorepo-aware install and build commands.

Set these Vercel environment variables:

- Investor web: `NEXT_PUBLIC_API_URL`, `ADMIN_WEB_URL`, `OPERATOR_WEB_URL`
- Admin web: `NEXT_PUBLIC_API_URL`
- Operator web: `NEXT_PUBLIC_API_URL`

Deploy the Nest API, Postgres, and Redis on a container-capable host such as Fly.io, Render, Railway, ECS, or a VM, then point `NEXT_PUBLIC_API_URL` at the public API URL.
