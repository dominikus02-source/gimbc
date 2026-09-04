# CONTRACTS.md — Shared Type Contracts

## Rules

- Frontend must **not** depend on database internals (table names, column types, Supabase-specific helpers).
- Backend exposes stable contracts via shared types.
- Breaking contract changes require coordination between frontend and backend owners.
- Shared types must have **one canonical definition** (single source of truth).
- Frontend must **not** assume undocumented backend behavior.

## Contract Definitions

All types below are the canonical definitions. Backend returns data matching these shapes. Frontend consumes them directly.

### Player

```typescript
interface Player {
  id: string;              // UUID
  username: string;
  avatarId: string;        // References Avatar definition
  level: number;
  xp: number;
  coins: number;
  createdAt: string;       // ISO 8601
}
```

### GameSession

```typescript
interface GameSession {
  id: string;              // UUID
  instanceId: string;      // Which world instance this session belongs to
  playerId: string;        // References Player.id
  worldId: string;         // e.g. "bahasa-village"
  startedAt: string;       // ISO 8601
  endedAt: string | null;  // ISO 8601, null if still active
}
```

### PlayerPosition

```typescript
interface PlayerPosition {
  sessionId: string;       // References GameSession.id
  playerId: string;        // References Player.id
  x: number;
  y: number;
  z: number;
  rotationY: number;       // Y-axis rotation in radians
  updatedAt: string;       // ISO 8601
}
```

### Quest

```typescript
interface Quest {
  id: string;              // UUID
  name: string;
  description: string;
  npcId: string;           // NPC who assigns this quest
  worldId: string;         // Which world this quest belongs to
  requiredLevel: number;   // Minimum player level to accept
  xpReward: number;
  coinReward: number;
  order: number;           // Display / progression order within a zone
}
```

### QuestProgress

```typescript
interface QuestProgress {
  id: string;              // UUID
  playerId: string;        // References Player.id
  questId: string;         // References Quest.id
  status: "active" | "completed" | "failed";
  startedAt: string;       // ISO 8601
  completedAt: string | null; // ISO 8601, null if not completed
}
```

### Reward

```typescript
interface Reward {
  id: string;              // UUID
  playerId: string;        // References Player.id
  questId: string;         // References Quest.id
  type: "xp" | "coin" | "item";
  amount: number;          // XP or coin amount; 1 for items
  itemId: string | null;   // References item if type is "item"
  grantedAt: string;       // ISO 8601
}
```

## Contract Change Process

1. Backend owner proposes change and updates this document.
2. Frontend owner reviews for impact.
3. Both owners agree before implementation begins.
4. No breaking changes shipped without frontend adaptation planned in the same or prior release.
