# PANDUAN INTEGRASI FRONTEND — Backend siap dikonsumsi (v1)

> Untuk: team frontend (Dominikus). Status backend di `main`: migrasi `0001-0004`
> merge; `0005` + tests + CI menunggu final approval (CI sudah GREEN 22/22).
> Aturan utama: JANGAN pakai nama tabel/kolom DB langsung (`docs/CONTRACTS.md:5`).
> Konsumsi hanya bentuk kontrak + endpoint di bawah.

## 1. Bentuk data (canonical, dari `docs/CONTRACTS.md`)

`Player { id, username, avatarId, level, xp, coins, createdAt }` ·
`GameSession { id, instanceId, playerId, worldId, startedAt, endedAt|null }` ·
`PlayerPosition { sessionId, playerId, x, y, z, rotationY, updatedAt }` ·
`Quest { id, name, description, npcId, worldId, requiredLevel, xpReward, coinReward, order }` ·
`QuestProgress { id, playerId, questId, status: active|completed|failed, startedAt, completedAt|null }` ·
`Reward { id, playerId, questId, type: xp|coin|item, amount, itemId|null, grantedAt }`

Semua waktu ISO 8601. `Quest.order` tetap `order` di API (kolom DB `sort_order` internal).

## 2. Endpoint (dari `docs/BACKEND_API_SPEC.md`, implementasi Phase 5)

- `GET /api/player/me` → `Player` · `PATCH /api/player/me { username?, avatarId? }` → `Player`
- `GET /api/quests?worldId=bahasa-village` → `Quest[]` (urut `order`)
- `POST /api/quests/:questId/start` → `QuestProgress` (gagal jika level kurang)
- `POST /api/quests/:questId/answer { answerId }` → `{ correct, progress, rewards }`
- `GET /api/rewards` → `Reward[]` · `GET /api/quests/progress` → `QuestProgress[]`
- `POST /api/sessions/join { worldId, instanceId? }` → `GameSession` (penuh → `INSTANCE_FULL`)
- `POST /api/sessions/:sessionId/leave` → `GameSession`

## 3. Yang bisa di-mock sekarang (tanpa Supabase live)

- Jawaban: `correct=true` → progress `completed` + 2 reward + xp/coins naik; `false` → `failed`, tanpa reward.
- Join: tanpa `instanceId` → dibuatkan/ditempatkan otomatis; instance max 30.
- Posisi: tulis milik sendiri, baca semua (pengetatan se-instance menyusul Phase 6).

## 4. Realtime (usulan, butuh agree)

Channel `instance:{instanceId}`, event `position` = `PlayerPosition`, presence 30 pemain
(`docs/BACKEND_REALTIME_NOTES.md`). Jangan polling HTTP untuk posisi.

## 5. Keputusan terbuka (frontend boleh pakai default sambil jalan)

| Item | Default sementara | Final oleh |
|---|---|---|
| Auth | email/password (`BACKEND_AUTH_RECOMMENDATION.md`) | TL 1 centang |
| Channel/event | `instance:{id}` / `position` | agree berdua |
| Avatar/NPC/Challenge/Inventory | BELUM ADA kontrak — jangan kodekan dulu | proposal 002 |
| Skema jawaban challenge | BELUM ADA — tiru `{ answerId }` generik dulu | Phase 7 |

## 6. Yang backend JAMIN tidak berubah

6 tabel, composite PK posisi, `order` di API, RLS deny-by-default, reward/quest
server-side — semua sudah dikunci + CI hijau tiap push (`backend-sql-tests`).
Perubahan kontrak mengikuti `docs/CONTRACTS.md:99-104` (propose → review → agree).
