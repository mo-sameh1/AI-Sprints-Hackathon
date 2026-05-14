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

## Railway Backend

Use Railway for the API plus managed Postgres and Redis.

### Account Setup

1. Create or log into a Railway account: `https://railway.com`.
2. Connect the GitHub account that owns this repository.
3. Create a new Railway project.
4. Add a PostgreSQL database service.
5. Add a Redis database service.
6. Add a new service from this GitHub repository.

### API Service Settings

Set the API service source to this repository and deploy the branch that contains the deployment config.

Railway reads `railway.toml` at the repo root. That file points Railway to `infra/docker/Dockerfile.api`, runs Prisma migrations before deployment, and uses `/api/health` as the health check.

Add these variables to the API service, not shared variables:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=replace-me
GEMINI_MODEL=gemini-3.1-flash-lite
WEATHER_PROVIDER=open-meteo
NEWS_API_KEY=replace-me
NEWS_PROVIDER=gdelt
GEOCODING_PROVIDER=open-meteo
GEOSPATIAL_PROVIDER=open-meteo
SATELLITE_API_KEY=replace-me-if-ndvi-provider-is-added
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=replace-me
TWILIO_AUTH_TOKEN=replace-me
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WEBHOOK_URL=https://replace-me.ngrok-free.app/integrations/whatsapp/webhook
TWILIO_VALIDATE_WEBHOOKS=true
CORS_ORIGINS=https://your-investor.vercel.app,https://your-admin.vercel.app,https://your-operator.vercel.app
```

If your Railway database services are named differently, update the references to match the exact service names.

After deployment, generate a public domain for the API service in Railway. The URL should look similar to:

```env
https://your-api-service.up.railway.app
```

Then set this value in each Vercel web project:

```env
NEXT_PUBLIC_API_URL=https://your-api-service.up.railway.app
```

For the investor Vercel project, also set:

```env
ADMIN_WEB_URL=https://your-admin.vercel.app
OPERATOR_WEB_URL=https://your-operator.vercel.app
```
