# BACKEND_SCHEMA_DRAFT — Baseline dari CONTRACTS.md (DRAFT, belum di-apply)

> Status: **DRAFT untuk review teamleader. JANGAN di-apply ke Supabase sebelum approval.**
> Branch: `feat/backend-contracts-baseline-draft`
> Sumber tunggal kebenaran: `docs/CONTRACTS.md`. File ini tidak menambah tabel/entitas baru.

## Referensi markdown yang dipakai (tanpa halusinasi)

- `docs/CONTRACTS.md:15-27` — `Player { id, username, avatarId, level, xp, coins, createdAt }`
- `docs/CONTRACTS.md:29-40` — `GameSession { id, instanceId, playerId, worldId, startedAt, endedAt | null }`
- `docs/CONTRACTS.md:42-54` — `PlayerPosition { sessionId, playerId, x, y, z, rotationY, updatedAt }` (tanpa `id`)
- `docs/CONTRACTS.md:56-69` — `Quest { id, name, description, npcId, worldId, requiredLevel, xpReward, coinReward, order }`
- `docs/CONTRACTS.md:72-83` — `QuestProgress { id, playerId, questId, status: active|completed|failed, startedAt, completedAt | null }`
- `docs/CONTRACTS.md:85-97` — `Reward { id, playerId, questId, type: xp|coin|item, amount, itemId | null, grantedAt }`
- `docs/CONTRACTS.md:5` — Frontend dilarang bergantung pada nama tabel/kolom internal. Nama tabel di bawah adalah usulan backend saja.
- `docs/ARCHITECTURE.md:35` — Auth Phase 5 = game-local only. SSO production ditunda. Maka RLS di bawah default-deny, tanpa policy berbasis user sampai auth diputuskan.
- `docs/ARCHITECTURE.md:37-39` — Frontend tidak boleh pegang service-role. Operasi sensitif via server-side.
- `docs/CONTEXT.md:24`, `docs/GAME_DESIGN.md:43` — Maks 30 pemain per instance. Relevan untuk `player_positions`.
- `docs/IMPLEMENTATION_PLAN.md:75-85` — Phase 5 butuh persist player, quest progress, inventory, auth. Inventory belum ada di CONTRACTS, jadi TIDAK dibuat di draft ini (lihat Open Questions).
- `docs/GAME_DESIGN.md:5-21` — Avatar, NPC, Challenge, Monster didefinisikan sebagai konsep game, tapi belum ada di CONTRACTS, jadi TIDAK dibuat tabelnya di draft ini.

## Pemetaan kontrak → kolom (1:1, tanpa tambahan)

| Kontrak | Kolom SQL | Tipe SQL | Keterangan |
|---|---|---|---|
| Player.id | id | UUID PK | `docs/CONTRACTS.md:18` |
| Player.username | username | TEXT NOT NULL | `docs/CONTRACTS.md:19` |
| Player.avatarId | avatar_id | TEXT NOT NULL | `docs/CONTRACTS.md:20`, referensi definisi Avatar (belum ada tabel) → tanpa FK |
| Player.level | level | INTEGER NOT NULL | `docs/CONTRACTS.md:21` |
| Player.xp | xp | INTEGER NOT NULL | `docs/CONTRACTS.md:22` |
| Player.coins | coins | INTEGER NOT NULL | `docs/CONTRACTS.md:23` |
| Player.createdAt | created_at | TIMESTAMPTZ NOT NULL | `docs/CONTRACTS.md:24`, ISO 8601 |
| GameSession.id | id | UUID PK | `docs/CONTRACTS.md:32` |
| GameSession.instanceId | instance_id | TEXT NOT NULL | `docs/CONTRACTS.md:33` |
| GameSession.playerId | player_id | UUID NOT NULL FK → players.id | `docs/CONTRACTS.md:34` |
| GameSession.worldId | world_id | TEXT NOT NULL | `docs/CONTRACTS.md:35`, cth. `bahasa-village` |
| GameSession.startedAt | started_at | TIMESTAMPTZ NOT NULL | `docs/CONTRACTS.md:36` |
| GameSession.endedAt | ended_at | TIMESTAMPTZ NULL | `docs/CONTRACTS.md:37` |
| PlayerPosition.sessionId | session_id | UUID NOT NULL FK → game_sessions.id | `docs/CONTRACTS.md:45` |
| PlayerPosition.playerId | player_id | UUID NOT NULL FK → players.id | `docs/CONTRACTS.md:46` |
| PlayerPosition.x/y/z | x, y, z | DOUBLE PRECISION NOT NULL | `docs/CONTRACTS.md:47-49` |
| PlayerPosition.rotationY | rotation_y | DOUBLE PRECISION NOT NULL | `docs/CONTRACTS.md:50`, radian sumbu-Y |
| PlayerPosition.updatedAt | updated_at | TIMESTAMPTZ NOT NULL | `docs/CONTRACTS.md:51` |
| Quest.id | id | UUID PK | `docs/CONTRACTS.md:59` |
| Quest.name | name | TEXT NOT NULL | `docs/CONTRACTS.md:60` |
| Quest.description | description | TEXT NOT NULL | `docs/CONTRACTS.md:61` |
| Quest.npcId | npc_id | TEXT NOT NULL | `docs/CONTRACTS.md:62`, tanpa FK (NPC belum di kontrak) |
| Quest.worldId | world_id | TEXT NOT NULL | `docs/CONTRACTS.md:63` |
| Quest.requiredLevel | required_level | INTEGER NOT NULL | `docs/CONTRACTS.md:64` |
| Quest.xpReward | xp_reward | INTEGER NOT NULL | `docs/CONTRACTS.md:65` |
| Quest.coinReward | coin_reward | INTEGER NOT NULL | `docs/CONTRACTS.md:66` |
| Quest.order | sort_order | INTEGER NOT NULL | `docs/CONTRACTS.md:67`, lihat Q2 di bawah — `order` reserved keyword |
| QuestProgress.id | id | UUID PK | `docs/CONTRACTS.md:75` |
| QuestProgress.playerId | player_id | UUID NOT NULL FK → players.id | `docs/CONTRACTS.md:76` |
| QuestProgress.questId | quest_id | UUID NOT NULL FK → quests.id | `docs/CONTRACTS.md:77` |
| QuestProgress.status | status | TEXT NOT NULL CHECK active/completed/failed | `docs/CONTRACTS.md:78` |
| QuestProgress.startedAt | started_at | TIMESTAMPTZ NOT NULL | `docs/CONTRACTS.md:79` |
| QuestProgress.completedAt | completed_at | TIMESTAMPTZ NULL | `docs/CONTRACTS.md:80` |
| Reward.id | id | UUID PK | `docs/CONTRACTS.md:88` |
| Reward.playerId | player_id | UUID NOT NULL FK → players.id | `docs/CONTRACTS.md:89` |
| Reward.questId | quest_id | UUID NOT NULL FK → quests.id | `docs/CONTRACTS.md:90` |
| Reward.type | type | TEXT NOT NULL CHECK xp/coin/item | `docs/CONTRACTS.md:91` |
| Reward.amount | amount | INTEGER NOT NULL | `docs/CONTRACTS.md:92` |
| Reward.itemId | item_id | TEXT NULL | `docs/CONTRACTS.md:93`, tanpa FK (item belum di kontrak) |
| Reward.grantedAt | granted_at | TIMESTAMPTZ NOT NULL | `docs/CONTRACTS.md:94` |

## Draft SQL (Postgres / Supabase, belum di-apply)

```sql
-- BACKEND_SCHEMA_DRAFT v0.1 — 1:1 dari docs/CONTRACTS.md
-- JANGAN APPLY sebelum approval teamleader.
-- Membutuhkan ekstensi pgcrypto untuk gen_random_uuid() jika default UUID dipakai.

-- Players: docs/CONTRACTS.md:15-27
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  avatar_id text not null,
  level integer not null check (level >= 1),
  xp integer not null check (xp >= 0),
  coins integer not null check (coins >= 0),
  created_at timestamptz not null default now()
);

-- Game sessions: docs/CONTRACTS.md:29-40
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  instance_id text not null,
  player_id uuid not null references players (id) on delete cascade,
  world_id text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz null,
  check (ended_at is null or ended_at >= started_at)
);

-- Player positions: docs/CONTRACTS.md:42-54
-- Kontrak tidak mendefinisikan `id`; usulan PK komposit (session_id, player_id) = 1 baris per pemain per sesi.
-- Alternatif (surrogate id) masih open — lihat Q1.
create table if not exists player_positions (
  session_id uuid not null references game_sessions (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  x double precision not null,
  y double precision not null,
  z double precision not null,
  rotation_y double precision not null,
  updated_at timestamptz not null default now(),
  primary key (session_id, player_id)
);

-- Quests: docs/CONTRACTS.md:56-69
-- Contract field `order` dipetakan ke `sort_order` karena ORDER reserved keyword. Lihat Q2.
create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  npc_id text not null,
  world_id text not null,
  required_level integer not null check (required_level >= 1),
  xp_reward integer not null check (xp_reward >= 0),
  coin_reward integer not null check (coin_reward >= 0),
  sort_order integer not null
);

-- Quest progress: docs/CONTRACTS.md:72-83
create table if not exists quest_progress (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  quest_id uuid not null references quests (id) on delete cascade,
  status text not null check (status in ('active', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  check (completed_at is null or completed_at >= started_at),
  unique (player_id, quest_id)
);

-- Rewards: docs/CONTRACTS.md:85-97
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  quest_id uuid not null references quests (id) on delete cascade,
  type text not null check (type in ('xp', 'coin', 'item')),
  amount integer not null check (amount >= 0),
  item_id text null,
  granted_at timestamptz not null default now(),
  check ((type = 'item' and item_id is not null) or (type in ('xp', 'coin')))
);

-- RLS: ON untuk semua tabel. Default-deny sampai auth Phase 5 diputuskan.
-- Alasan: docs/ARCHITECTURE.md:35 (game-local auth, belum diputuskan) + :37-39 (no service-role di frontend).
alter table players enable row level security;
alter table game_sessions enable row level security;
alter table player_positions enable row level security;
alter table quests enable row level security;
alter table quest_progress enable row level security;
alter table rewards enable row level security;

-- Sengaja TIDAK ada CREATE POLICY di draft ini.
-- service_role bypass RLS (default Supabase) untuk server-side; anon/authenticated ditolak sampai policy Phase 5 disetujui.

-- Index usulan (berasal langsung dari FK + query loop inti ENTER→EXPLORE→MEET→ANSWER→REWARD):
create index if not exists idx_game_sessions_player on game_sessions (player_id);
create index if not exists idx_game_sessions_instance on game_sessions (instance_id);
create index if not exists idx_player_positions_session on player_positions (session_id);
create index if not exists idx_quest_progress_player on quest_progress (player_id);
create index if not exists idx_quest_progress_quest on quest_progress (quest_id);
create index if not exists idx_rewards_player on rewards (player_id);
create index if not exists idx_rewards_quest on rewards (quest_id);
create index if not exists idx_quests_world_order on quests (world_id, sort_order);
```

## Open Questions — perlu approval teamleader (jangan halusinasi)

- **Q1 — PK `player_positions`:** kontrak tidak punya `id` (`docs/CONTRACTS.md:42-54`). Draft pakai PK komposit `(session_id, player_id)`. Alternatif: tambah `id uuid PK` + unique constraint. Butuh keputusan sebelum migrasi. Dampak frontend: tidak ada (frontend pakai kontrak `PlayerPosition`, bukan PK — `docs/CONTRACTS.md:5`).
- **Q2 — `Quest.order` → `sort_order`:** `order` adalah reserved keyword Postgres. Draft memetakan ke kolom `sort_order`. Ini pemetaan kontrak→DB yang butuh persetujuan kedua owner per `docs/CONTRACTS.md:99-104`. Alternatif: kolom `"order"` quoted (tidak disarankan).
- **Q3 — Default `gen_random_uuid()` dan `now()`:** kontrak hanya bilang UUID dan ISO 8601, tidak bilang default. Draft menambahkan default standar Postgres. Setujui / hapus?
- **Q4 — `UNIQUE (player_id, quest_id)` di `quest_progress`:** mencegah duplikat progress aktif untuk quest yang sama. Tidak tertulis di kontrak. Setujui / hapus? Jika quest boleh diulang, constraint ini salah.
- **Q5 — `CHECK` level >= 1, xp/coins/amount >= 0, ended_at >= started_at:** tidak tertulis di kontrak, hanya akal sehat dari `docs/GAME_DESIGN.md:24-32`. Setujui / hapus?
- **Q6 — RLS policy Phase 5:** auth belum diputuskan (`docs/ARCHITECTURE.md:35`). Draft = deny-by-default. Setelah auth diputuskan, policy `auth.uid() = player_id` atau server-side-only perlu desain terpisah. Jangan buat policy sebelum itu.
- **Q7 — Yang SENGAJA tidak dibuat (jangan ditambah tanpa kontrak baru):** `avatars`, `npcs`, `challenges`, `monsters`, `inventory/items` — disebut di `docs/GAME_DESIGN.md:5-21` dan inventory disyaratkan `docs/IMPLEMENTATION_PLAN.md:75-85`, tapi belum ada di `docs/CONTRACTS.md`. Perlu update CONTRACTS dulu via proses `docs/CONTRACTS.md:99-104`, baru buat tabel.
- **Q8 — Lokasi file migrasi final:** draft ini di `docs/` agar tidak mengarang struktur `supabase/migrations/` sebelum disetujui. Setujui lokasi final (`supabase/migrations/`) dan konvensi penamaan?

## Verifikasi draft ini

- [x] 6 interface kontrak terpetakan 1:1, tidak ada tabel tambahan
- [x] Tidak ada secret/kredensial
- [x] Tidak ada koneksi ke production (isolasi: `AGENTS.md:7-13`)
- [ ] Menunggu approval teamleader untuk Q1–Q8 sebelum dijadikan migrasi final + PR ke `main`
