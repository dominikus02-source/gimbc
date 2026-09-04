# BACKEND PHASE 5 PREP — Checklist + Rencana (Docs saja, tanpa kode)

> Branch: `feat/backend-phase5-prep` (terpisah dari PR approval `feat/backend-contracts-baseline-draft` agar tidak tercampur).
> Status: PERSIAPAN. Tidak ada migrasi / kredensial / koneksi DB di file ini.
> Prasyarat: Q1–Q8 di `docs/APPROVAL_REQUEST_001_BACKEND_BASELINE.md` harus di-approve dulu sebelum migrasi final dibuat.

## 1. Objective

Siapkan backend agar setelah baseline di-approve, eksekusi Phase 5 sekali jalan tanpa bolak-balik.
Sumber: `docs/IMPLEMENTATION_PLAN.md:75-85` — Phase 5 butuh: player profile, quest progress, inventory, auth (basic).

## 2. Yang TIDAK dikerjakan sekarang (batas jelas)

- Tidak buat migrasi final sebelum Q1–Q8 approve.
- Tidak buat tabel `avatars/npcs/challenges/monsters/inventory` sebelum ada kontrak baru (`docs/CONTRACTS.md:99-104` wajib agree berdua).
- Tidak ada dedicated game server (`docs/ARCHITECTURE.md:66-71`).
- Tidak ada integrasi production BahasaCerdas (`AGENTS.md:7-13`).
- Tidak ada secret di git (`AGENTS.md:41`).

## 3. Checklist setup Supabase (manual, via dashboard)

- [ ] Buat project Supabase BARU khusus game (terpisah dari production).
- [ ] Simpan URL + anon key di password manager, JANGAN di git.
- [ ] Aktifkan Auth → pilih 1 metode game-local saja (email/password ATAU magic link). SSO production ditunda (`docs/ARCHITECTURE.md:35`).
- [ ] Aktifkan Realtime hanya untuk tabel posisi (persiapan Phase 6, max 30/instance — `docs/CONTEXT.md:24`).
- [ ] Catat project ref di issue privat, bukan di repo.

## 4. Konvensi env (usulan, butuh agree shared)

```
# .env.local (JANGAN commit file ini)
SUPABASE_URL=
SUPABASE_ANON_KEY=
# SERVICE_ROLE hanya di server-side / dashboard, TIDAK PERNAH di frontend (docs/ARCHITECTURE.md:37-39)
```

- [ ] Sepakati nama variabel di atas dengan frontend (shared concern: `TEAM_WORKFLOW.md:36-41`).
- [ ] Tambah `.env.example` berisi nama saja (tanpa nilai) setelah disepakati.

## 5. Urutan eksekusi setelah Q1–Q8 approve (sekali jalan)

1. Jadikan `docs/BACKEND_SCHEMA_DRAFT.md` → `supabase/migrations/0001_baseline.sql` (1 PR).
2. Tentukan kaitan `players.id` ↔ `auth.users.id` (butuh keputusan auth no.3 di atas).
3. Tulis RLS policy Phase 5 (pengganti default-deny): pemain hanya baca/tulis miliknya, baca `quests` publik, tulis `quest_progress/rewards` via server-side.
4. API server-side untuk: profil, quest progress, grant reward (anti-cheat: jangan percaya XP/coins dari client).
5. Usulkan kontrak baru (Avatar/NPC/Challenge/Inventory) sebagai issue → agree frontend → baru buat tabel.

## 6. Output paket ini

- [x] File rencana ini (tanpa kode, tanpa rework saat Q berubah)
- [ ] Keputusan auth (email/password vs magic link)
- [ ] Kesepakatan nama env dengan frontend
- [ ] Setelah itu: 1 migrasi final + RLS Phase 5
