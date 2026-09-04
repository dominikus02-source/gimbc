-- 0001_baseline.sql — Backend baseline 1:1 dari docs/CONTRACTS.md
-- Owner: Sugeng Riyanto (Backend). Otoritas: day-to-day backend per TEAM_WORKFLOW.md:46,
-- tabel/kolom internal milik backend per CONTRACTS.md:5. Tanpa ubah kontrak.
--
-- Keputusan backend (final, sesuai markdown):
-- Q1: player_positions PK komposit (session_id, player_id). Kontrak tidak punya id
--     (CONTRACTS.md:42-54). 1 baris per pemain per sesi, cocok max 30/instance (CONTEXT.md:24).
-- Q2: kontrak field `order` (CONTRACTS.md:67) dipetakan ke kolom `sort_order`
--     karena ORDER reserved keyword. API tetap kembalikan `order`. Tanpa breaking change
--     (kontrak tak berubah, DB internal milik backend per CONTRACTS.md:5).
-- Q3: default gen_random_uuid() + now() — standar Postgres untuk UUID + ISO 8601.
-- Q4: UNIQUE(player_id, quest_id) cegah duplikat. Jika quest repeatable dibutuhkan,
--     cabut via migrasi baru + diskusi kontrak (CONTRACTS.md:99-104).
-- Q5: CHECK level>=1, xp/coins/amount>=0, selesai>=mulai — dari GAME_DESIGN.md:24-32.
-- Q6: RLS ON semua tabel, tanpa policy (deny-by-default). Policy Phase 5 setelah
--     metode auth game-local dikunci (ARCHITECTURE.md:35). service_role untuk server-side.
-- Q8: lokasi supabase/migrations/ — migrasi milik backend (TEAM_WORKFLOW.md:67).
-- Q7: SENGAJA tanpa tabel avatars/npcs/challenges/monsters/inventory — belum di kontrak,
--     butuh agree frontend dulu (CONTRACTS.md:99-104). Jangan tambah di file ini.

-- Players: CONTRACTS.md:15-27
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  avatar_id text not null,
  level integer not null check (level >= 1),
  xp integer not null check (xp >= 0),
  coins integer not null check (coins >= 0),
  created_at timestamptz not null default now()
);

-- Game sessions: CONTRACTS.md:29-40
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  instance_id text not null,
  player_id uuid not null references players (id) on delete cascade,
  world_id text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz null,
  check (ended_at is null or ended_at >= started_at)
);

-- Player positions: CONTRACTS.md:42-54
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

-- Quests: CONTRACTS.md:56-69
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
comment on column quests.sort_order is 'Maps to contract field Quest.order (CONTRACTS.md:67). API returns order.';

-- Quest progress: CONTRACTS.md:72-83
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

-- Rewards: CONTRACTS.md:85-97
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

-- RLS deny-by-default (ARCHITECTURE.md:35,37-39). Policy menyusul di Phase 5.
alter table players enable row level security;
alter table game_sessions enable row level security;
alter table player_positions enable row level security;
alter table quests enable row level security;
alter table quest_progress enable row level security;
alter table rewards enable row level security;

-- Indexes untuk core loop ENTER->EXPLORE->MEET->ANSWER->REWARD (CONTEXT.md:8-11)
create index if not exists idx_game_sessions_player on game_sessions (player_id);
create index if not exists idx_game_sessions_instance on game_sessions (instance_id);
create index if not exists idx_player_positions_session on player_positions (session_id);
create index if not exists idx_quest_progress_player on quest_progress (player_id);
create index if not exists idx_quest_progress_quest on quest_progress (quest_id);
create index if not exists idx_rewards_player on rewards (player_id);
create index if not exists idx_rewards_quest on rewards (quest_id);
create index if not exists idx_quests_world_order on quests (world_id, sort_order);
