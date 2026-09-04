# ARCHITECTURE.md — Technical Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js (App Router) |
| Language | TypeScript |
| 3D Rendering | React Three Fiber + Three.js |
| 3D Assets | Blender → GLB/GLTF |
| Backend / Database | Supabase |
| Hosting | Vercel |
| Realtime | Supabase Realtime (lightweight) |

## Architectural Principle

```
GAME CLIENT
    ↓
GAME BACKEND
    ↓
GAME SUPABASE
```

- The **Game Client** is the Next.js + React Three Fiber application.
- The **Game Backend** consists of Supabase functions, API routes, and server actions.
- **Game Supabase** is the game's own Supabase project, independent from production BahasaCerdas.

## Key Principles

### Database Isolation
The game database is **independent** from production BahasaCerdas. There is no database-to-database coupling.

### Authentication (Phase 5)
Phase 5 authentication means **game-local authentication only** (email/password, magic link, or similar Supabase Auth). Production BahasaCerdas SSO and identity handoff remain **postponed**. Do not implement cross-system auth in Phase 0–7.

### Client Security
- Frontend must **never** contain service-role credentials.
- All sensitive operations go through server-side code.

### Multiplayer Strategy
- **Supabase Realtime** is an initial prototype / lightweight transport option, not a permanent architectural commitment.
- The architecture **must allow replacement** with a dedicated realtime or game server if future gameplay requirements demand it.
- Do **not** prematurely introduce dedicated game servers.
- Instance-based, maximum 30 concurrent players per instance.

### Asset Pipeline
- 3D models authored in Blender.
- Exported as GLB/GLTF.
- Loaded by the React Three Fiber client.

## Directory Structure (Planned)

```
/
├── src/              # Application source (added in Phase 1)
│   ├── app/          # Next.js App Router
│   ├── components/   # React components
│   ├── game/         # Three.js / R3F game logic
│   └── lib/          # Shared utilities
├── docs/             # Project documentation
├── public/           # Static assets
└── ...config files
```

## What This Architecture Does NOT Include (Yet)

- No dedicated game servers
- No microservices
- No production BahasaCerdas integration
- No billing or premium infrastructure
- No CDN for game assets (beyond Vercel defaults)
