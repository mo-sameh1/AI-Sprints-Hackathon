# .AGENTS

This folder is the coordination hub for human teammates working with their own coding agents.

## Read Order

1. `STATUS.md`
2. `DECISIONS.md`
3. `ARCHITECTURE.md`
4. your assigned `*_AGENT.md`
5. `TASK_BOARD.md`

## Repo Principle

This project is **investor-first**, but not investor-only.

- investors drive the strongest product story and should receive the highest UX and reasoning quality
- operators are the input quality engine
- admins are the trust and control layer

## Agent Collaboration Rules

- claim one workstream before editing
- prefer staying inside your assigned path ownership
- do not rename major folders without updating `DECISIONS.md`
- if you change cross-cutting contracts, update `STATUS.md` and `TASK_BOARD.md`
- if you touch shared types, notify frontend, backend, and AI workstreams

## Current Scaffold Status

The repo is scaffolded, not production-ready.

- folder structure exists
- git repo initialized
- app shells exist
- backend modules, controllers, and services are stubbed
- AI pipelines are stubbed
- infra notes exist

## Checkpointing and Commits

- You must checkpoint your implementation with git commits, to ensure that you can revert to a working commit in case of failure

## .AGENTS/ Updates

- You must update the .AGENTS/ folder as you go, to keep track of progress, and allow agents to continue working to ensure a fully working product.

