# BACKEND API SPEC (DRAFT) — Server-side only untuk operasi sensitif

> Status: DRAFT backend. Bentuk kontrak frontend↔backend mengikuti `docs/CONTRACTS.md` (tanpa tabel internal).
> Prinsip: client tidak dipercaya untuk XP/coins/reward (anti-cheat, milik backend).
> Auth: game-local only (`docs/ARCHITECTURE.md:35`). Semua endpoint butuh sesi authenticated kecuali baca `quests`.

## Konvensi

- Format waktu: ISO 8601 (`createdAt`, `startedAt`, dst. per CONTRACTS).
- `Quest.order` tetap `order` di API (kolom DB `sort_order` hanya internal — lihat `0001_baseline.sql`).
- Error: `{ "error": "<kode_sederhana>" }` dengan HTTP status yang wajar.

## Endpoint (usulan)

### 1. Profil
- `GET /api/player/me` → `Player`
- `PATCH /api/player/me` body `{ username?, avatarId? }` → `Player`
  - Via fungsi server `update_profile()` (service_role). Client tanpa UPDATE langsung.
  - `level/xp/coins` TIDAK bisa diubah client (server-side only).

### 2. Quest
- `GET /api/quests?worldId=bahasa-village` → `Quest[]` (urut `order`)
- `POST /api/quests/:questId/start` → `QuestProgress` (status `active`)
  - Gagal jika `requiredLevel` belum terpenuhi.
- `GET /api/quests/progress` → `QuestProgress[]` milik pemain.

### 3. Challenge jawab (server-validated)
- `POST /api/quests/:questId/answer` body `{ answerId }` → `{ correct, progress: QuestProgress, rewards: Reward[] }`
  - Server yang menilai benar/salah, mengubah `active → completed/failed`, meng-grant `Reward`, menambah `xp/coins` dalam 1 transaksi (service_role).
  - Client tidak pernah kirim `xp`/`coins` sendiri.

### 4. Rewards
- `GET /api/rewards` → `Reward[]` milik pemain (read-only, tidak ada POST dari client).

### 5. Session/posisi (persiapan Phase 6, max 30/instance)
- `POST /api/sessions/join` body `{ worldId, instanceId? }` → `GameSession`
- `POST /api/sessions/:sessionId/leave` → `GameSession` (set `endedAt`)
- Posisi sync via Supabase Realtime `player_positions` (baca sync, tulis milik sendiri — lihat `0002_rls_phase5.sql`). Jangan polling HTTP untuk posisi.

## Yang belum diputuskan (butuh agree)
- Metode auth: email/password vs magic link (backend usul email/password dulu — paling basic untuk Phase 5).
- Nama path final (`/api/...` vs server actions) — tunggu Phase 1 Next.js ada (`ARCHITECTURE.md:52-64`).
