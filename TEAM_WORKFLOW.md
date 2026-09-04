# TEAM_WORKFLOW.md

## Team

| Role | Owner |
|------|-------|
| Frontend / Game Client / 3D / UX | Dominikus Wahyu |
| Backend / Database / API / Security / Multiplayer | Sugeng Riyanto |

## Domain Ownership

### Frontend Owner (Dominikus Wahyu)
- React / Next.js client
- React Three Fiber and Three.js
- Camera system
- Player controller
- Avatar and animation
- World rendering
- NPC presentation
- HUD and UX
- Mobile controls
- Visual assets (Blender exports, GLB/GLTF)

### Backend Owner (Sugeng Riyanto)
- Supabase configuration and client
- Database schema and migrations
- Server-side APIs (API routes, server actions)
- Authentication and integration
- Player persistence
- Quest persistence
- Inventory and rewards
- Multiplayer / session infrastructure
- Authorization and security
- Anti-cheat

### Shared Concerns
- Architecture decisions
- Type contracts and shared interfaces
- Major product decisions
- `package.json` dependencies
- Environment variable conventions

## Decision Authority

- Dominikus owns day-to-day frontend implementation decisions.
- Sugeng owns day-to-day backend implementation decisions.
- Cross-cutting architectural decisions require agreement from both owners.
- Major product/architecture decisions require technical/product lead review before proceeding.

## Git Rules

### Branch Protection
- `main` must remain stable. No direct feature work on `main`.
- All feature work happens on feature branches.
- A PR is required before merging to `main`.

### Branch Naming
- `feat/frontend-*` — Frontend features
- `feat/backend-*` — Backend features
- `fix/frontend-*` — Frontend fixes
- `fix/backend-*` — Backend fixes
- `chore/*` — Maintenance, tooling, docs

### Code Ownership
- Never rewrite another person's branch.
- Avoid editing files owned by the other side unless coordinated.
- Migrations are backend-owned.
- Shared contracts (types, interfaces) must be agreed upon before implementation.

### PR Protocol
- PRs should be reviewed by the domain owner before merge.
- Keep PRs focused on a single concern.
- Describe what changed and why.
