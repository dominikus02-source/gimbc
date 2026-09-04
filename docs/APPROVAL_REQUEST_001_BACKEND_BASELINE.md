# APPROVAL REQUEST 001 — Baseline Schema Backend (DRAFT)

> Untuk: Teamleader
> Dari: Sugeng Riyanto (Backend)
> Branch: `feat/backend-contracts-baseline-draft`
> Status: **Menunggu keputusan. JANGAN merge / apply ke Supabase sebelum semua kotak di bawah dicentang.**
> File yang direview: `docs/BACKEND_SCHEMA_DRAFT.md`

---

## 1. Objective (Tujuan)

Mengunci fondasi backend supaya tidak bolak-balik:

1. 6 tabel persis dari kontrak (`docs/CONTRACTS.md`): `players`, `game_sessions`, `player_positions`, `quests`, `quest_progress`, `rewards`.
2. Tidak ada tabel tambahan.
3. RLS aktif, default-tolak, tanpa policy dulu (auth Phase 5 belum diputuskan).

## 2. Context (Latar singkat)

- Repo masih Phase 0: belum ada kode aplikasi (`docs/IMPLEMENTATION_PLAN.md:3-15`).
- Kontrak adalah satu-satunya sumber kebenaran (`docs/CONTRACTS.md:12-13`).
- Auth = game-local only, SSO ditunda (`docs/ARCHITECTURE.md:35`).
- Frontend tidak boleh pegang service-role (`docs/ARCHITECTURE.md:37-39`).
- Maks 30 pemain per instance (`docs/CONTEXT.md:24`).

## 3. Scope (Batasan jelas)

**Masuk:**
- `docs/BACKEND_SCHEMA_DRAFT.md` (+187 baris): pemetaan 1:1 kontrak → SQL + RLS.

**Sengaja TIDAK masuk (butuh kontrak baru dulu):**
- Tabel `avatars`, `npcs`, `challenges`, `monsters`, `inventory/items` — disebut di `docs/GAME_DESIGN.md` tapi belum ada di `docs/CONTRACTS.md`.
- Policy RLS berbasis user — menunggu keputusan auth Phase 5.
- Folder `supabase/migrations/` final — menunggu Q8.

## 4. Steps (Yang TL lakukan — ±5 menit)

1. Buka file `docs/BACKEND_SCHEMA_DRAFT.md`.
2. Untuk setiap Q1–Q8 di bawah, tulis keputusan: `Setuju` atau `Ubah: ...`.
3. Jika semua setuju → Approve PR.
4. Jika ada yang diubah → Request Changes, saya revisi 1x di branch yang sama.

## 5. Keputusan yang dibutuhkan (Q1–Q8)

- [ ] **Q1 — Kunci utama `player_positions`:** kontrak tidak punya `id`. Usulan: kunci komposit `(session_id, player_id)` = 1 baris per pemain per sesi. Alternatif: tambah `id` baru. Keputusan TL: ______
- [ ] **Q2 — `Quest.order` → `sort_order`:** kata `order` tidak boleh jadi nama kolom SQL. Usulan: pakai `sort_order`. Keputusan TL: ______
- [ ] **Q3 — Nilai otomatis:** usulan default `gen_random_uuid()` untuk id dan `now()` untuk waktu. Kontrak tidak menulis ini. Setuju / hapus? Keputusan TL: ______
- [ ] **Q4 — Cegah duplikat:** usulan `UNIQUE(player_id, quest_id)` di `quest_progress`. Hapus jika quest boleh diulang. Keputusan TL: ______
- [ ] **Q5 — Batas wajar:** usulan `level >= 1`, `xp/coins >= 0`, `selesai >= mulai`. Tidak ada di kontrak. Setuju / hapus? Keputusan TL: ______
- [ ] **Q6 — Keamanan (RLS):** usulan tolak semua akses dulu sampai auth Phase 5 diputuskan. Server-side via service-role tetap bisa. Setuju? Keputusan TL: ______
- [ ] **Q7 — Tidak tambah tabel:** setuju TIDAK buat avatar/npc/challenge/monster/inventory sampai ada kontrak baru yang disetujui frontend? Keputusan TL: ______
- [ ] **Q8 — Lokasi final:** setelah approve, draft dipindah ke `supabase/migrations/0001_baseline.sql`. Setuju? Keputusan TL: ______

## 6. Output (Hasil setelah approve)

- [ ] Draft menjadi 1 file migrasi final. Selesai, tidak diubah lagi.
- [ ] Backend lanjut ke paket berikut tanpa bongkar ulang: usulan kontrak baru (Avatar/NPC/Challenge/Inventory) dalam bentuk issue, bukan tabel langsung.
- [ ] RLS policy Phase 5 didesain terpisah setelah auth diputuskan.

## 7. Referensi (tanpa tambahan)

| Dokumen | Bagian |
|---|---|
| `docs/CONTRACTS.md` | Player:15-27, GameSession:29-40, PlayerPosition:42-54, Quest:56-69, QuestProgress:72-83, Reward:85-97, aturan perubahan:99-104 |
| `docs/ARCHITECTURE.md` | Auth Phase 5:35, service-role:37-39 |
| `docs/CONTEXT.md` | 30 pemain/instance:24 |
| `docs/GAME_DESIGN.md` | Avatar/NPC/Quest/Challenge/Monster:5-21 |
| `docs/IMPLEMENTATION_PLAN.md` | Phase 0:3-15, Phase 5:75-85 |
| `TEAM_WORKFLOW.md` | 1 PR 1 concern, review domain owner:50-72 |

## 8. Verifikasi pengaju

- [x] Isi 1:1 dari kontrak, tanpa tabel khayalan
- [x] Tanpa secret / kredensial
- [x] Tanpa akses database production
- [ ] Menunggu 8 keputusan TL di atas
