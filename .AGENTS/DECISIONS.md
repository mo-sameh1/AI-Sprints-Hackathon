# Decisions

## D-001 Monorepo

Use one repo with multiple apps and packages.

Reason:

- easier coordination in a hackathon
- shared contracts are simpler
- agent teams can own isolated paths

## D-002 Investor-First Product Framing

Investors are the highest-priority persona for the initial demo.

Reason:

- strongest value story in judging
- matching and deal logic are the most differentiated features
- investor trust is central to commercial viability

## D-003 Modular Monolith API

Use a Nest-style modular backend instead of immediate microservices.

Reason:

- fast to scaffold
- easier local development
- supports future separation if needed

## D-004 Separate AI Worker

Keep AI pipelines in `apps/ai-worker`.

Reason:

- isolates experimentation
- keeps backend request handlers simpler
- makes async job execution easier later

## D-005 Data Stores

Planned stores:

- Postgres for transactional data
- object storage for documents and media
- vector store for retrieval and AI memory
- Redis for cache and async coordination

Reason:

- matches the system architecture already agreed on

## D-006 Frontend Split

Use three separate apps:

- `investor-web`
- `operator-web`
- `admin-web`

Reason:

- each persona has different workflows
- investor experience can move fastest without being blocked by operator/admin UI

## D-007 Integrations As Providers

External systems are abstracted behind provider files.

Reason:

- easy mocking
- easier agent handoff
- future vendor swap is simpler

## D-008 Prisma Persistence

Use Prisma Client with Postgres for the API persistence layer.

Reason:

- keeps TypeScript data access explicit
- matches the planned transactional store
- lets demo seed data move out of service-local maps without changing API contracts

