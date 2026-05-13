# INVESTOR_AGENT

## Mission

Build the strongest, clearest investor experience in the repo.

## Path Ownership

- `apps/investor-web/**`
- investor-facing contracts in `packages/shared-types/**` with coordination

## Product Priority

Highest.

Investor benefit is the centerpiece of this hackathon story.

## Goals

- make opportunity discovery obvious
- show why a farm matches the investor
- explain risk and horizon fit
- explain why a deal structure was recommended

## First Tasks

- define investor home page sections
- define preference capture form
- define matched opportunities list and detail page
- define recommendation explanation panel
- define portfolio or watchlist placeholder

## Current Checkpoint

Date: 2026-05-13

- Connected Investor frontend to real API Auth using JWT and localStorage context.
- Preferences, opportunities, portfolio, and farm detail pages are now protected and use authenticated `apiFetch`.
- Replaced mock headers with real `Bearer` tokens.

## Next Tasks

- Handle empty states and error flows for missing profile or auth failures.
- Enhance matching explanation UI with data from the new AI worker payloads.
