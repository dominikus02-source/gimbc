# BahasaCerdas Game — Bahasa World

A multiplayer educational adventure game for learning Bahasa Indonesia. Players explore a stylized 3D world, meet NPCs, answer challenges, earn rewards, and progress through an Indonesian-inspired fantasy village.

## Current Phase

**Phase 0 — Foundation and Governance**

Repository structure and team documentation are being established. No application code yet.

## Stack

- **Frontend:** Next.js, TypeScript, React Three Fiber, Three.js
- **Backend:** Supabase (database, auth, realtime)
- **3D Assets:** Blender → GLB/GLTF
- **Hosting:** Vercel

## Team Ownership

| Domain | Owner |
|--------|-------|
| Frontend / Game Client / 3D / UX | Dominikus Wahyu |
| Backend / Database / API / Security / Multiplayer | Sugeng Riyanto |

## Development Principles

- This repository is **completely isolated** from production BahasaCerdas.
- `main` is stable; feature work happens on feature branches with PRs.
- Inspect existing code before modifying.
- Do not invent architecture when documentation defines it.
- No secrets in source control.
- No direct production database access.

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](./AGENTS.md) | Instructions for AI coding agents |
| [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) | Collaboration and git workflow |
| [docs/CONTEXT.md](./docs/CONTEXT.md) | Product vision |
| [docs/GAME_DESIGN.md](./docs/GAME_DESIGN.md) | Game mechanics and design |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture |
| [docs/WORLD_DESIGN.md](./docs/WORLD_DESIGN.md) | Bahasa Village world design |
| [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Phased development plan |
