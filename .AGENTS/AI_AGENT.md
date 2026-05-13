# AI_AGENT

## Mission

Own the intelligence layer and evaluation logic.

## Path Ownership

- `apps/ai-worker/**`

## Goals

- define profile extraction logic
- define ranking inputs and outputs
- define deal recommendation inputs and outputs
- define alert reasoning behavior

## First Tasks

- choose model responsibilities per pipeline
- define pipeline input and output shapes
- propose prompt skeletons
- document confidence and fallback behavior

## Guardrails

- keep investor explanations interpretable
- do not let generative output replace hard business constraints

## Current Checkpoint

Date: 2026-05-13

- Migrated LLM provider from OpenAI to Google Gemini (`gemini-1.5-flash`).
- Set deterministic fallback for offline/missing API key scenarios.
- System roles mapped to synthetic user/model turns for Gemini support.

## Next Tasks

- Wire real AI orchestration to replace remaining mock pipelines.
