# AGENTS.md

## Project Identity

**BahasaCerdas Game** (also called **Bahasa World**) is a multiplayer educational adventure game for learning Bahasa Indonesia. It is developed in the `gimbc` repository.

## Repository Isolation

This repository is **completely isolated** from the production BahasaCerdas codebase.

- DO NOT access, modify, import, copy, or depend on the production BahasaCerdas codebase.
- DO NOT connect to the production BahasaCerdas database.
- The game database is independent from production BahasaCerdas.

## Production Safety Rules

- No direct production database access from this repository.
- No service-role credentials in source control or client-side code.
- Frontend must never contain service-role credentials.
- Never perform destructive operations without explicit approval from the team owner.
- Do not add secrets, API keys, or environment credentials to source control.

## Team Ownership

### Frontend Owner: Dominikus Wahyu
Covers: React / Next.js client, React Three Fiber, Three.js, camera, player controller, avatar, animation, world rendering, NPC presentation, HUD, UX, mobile controls, visual assets.

### Backend Owner: Sugeng Riyanto
Covers: Supabase, database schema, migrations, server APIs, authentication, player persistence, quest persistence, inventory, rewards, multiplayer/session infrastructure, authorization, security, anti-cheat.

### Shared
Architecture decisions, contracts/types, major product decisions, `package.json`, environment conventions.

## Coding Principles

- Inspect existing code before modifying anything.
- Do not invent architecture when documentation already defines it.
- Keep changes focused and minimal for the task at hand.
- Follow existing code conventions in the file being edited.
- Check `package.json` or existing imports before assuming a library is available.
- Never commit secrets or keys.

## Testing Requirements

- Run lint and typecheck commands before completing a task.
- If unable to find the correct command, ask the user.

## Workflow

- Feature work must be done on feature branches, never directly on `main`.
- A PR is required before merging to `main`.
- `main` must remain stable at all times.
