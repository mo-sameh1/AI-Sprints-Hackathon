# Architecture

## Top-Level Shape

- `apps/api` owns business workflows and HTTP entrypoints
- `apps/ai-worker` owns profile extraction, ranking, recommendation, and alert reasoning
- `apps/investor-web` owns the highest-priority user experience
- `apps/operator-web` owns farm submission and reporting
- `apps/admin-web` owns review, triage, and overrides
- `packages/shared-types` owns shared contracts

## Core API Modules

- `auth`: identity and role enforcement
- `investors`: investor profile capture and portfolio-relevant inputs
- `operators`: operator profile drafting
- `farms`: farm retrieval and registry behavior
- `matches`: investor-to-farm ranking
- `deals`: structure recommendation
- `notifications`: weather/news-based reasoning and dispatch
- `reports`: operator report ingestion
- `admin`: review queues and operational control

## Integration Areas

- `weather`: forecast and climate context
- `news`: market and agricultural signal ingestion
- `geospatial`: maps, soil, NDVI, parcel enrichment
- `whatsapp`: operator-facing messaging channel
- `storage`: docs, images, voice notes, reports

## Data Ownership

- investors and preferences live in Postgres
- farms and crop cycles live in Postgres
- documents and media live in object storage
- embeddings and retrieval context live in a vector store
- job coordination lives in Redis

## Expected Flow

1. operator submits data
2. AI worker structures farm profile
3. backend stores profile and enrichment metadata
4. investor submits preferences
5. AI worker ranks farms
6. AI worker proposes a deal structure
7. admin reviews if needed

