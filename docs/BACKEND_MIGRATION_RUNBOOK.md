# BACKEND MIGRATION RUNBOOK — Cara apply 0001–0004 (manual, tanpa secret di git)

> Owner: Backend. Berlaku SETELAH PR paket baseline di-approve + merge.
> Prinsip: database game terpisah dari production (`AGENTS.md:7-13`); service-role
> tidak pernah ke frontend (`docs/ARCHITECTURE.md:37-39`).

## 1. Prasyarat

- [ ] Project Supabase BARU khusus game sudah dibuat via dashboard (bukan production).
- [ ] Kunci `service_role` hanya dipegang backend via dashboard/secret manager — JANGAN commit, JANGAN kirim via chat biasa.
- [ ] Branch yang berisi migrasi sudah merge ke `main` (urutan PR: baseline → 0003 → 0004).

## 2. Urutan apply (SATU KALI, berurutan, via SQL Editor dashboard)

1. `supabase/migrations/0001_baseline.sql` — 6 tabel + RLS ON + index.
2. `supabase/migrations/0002_rls_phase5.sql` — policy baca/tulis pemilik, rewards read-only.
3. `supabase/migrations/0003_grant_reward.sql` — fungsi `complete_quest` (service_role only).
4. `supabase/migrations/0004_instances.sql` — fungsi `join_instance`/`leave_instance` + cap 30.

Jalankan satu file, pastikan sukses, baru lanjut ke berikut. Jangan paralel.

## 3. Verifikasi setelah apply (read-only, aman)

```sql
-- 6 tabel ada
select tablename from pg_tables where schemaname='public' and tablename in
('players','game_sessions','player_positions','quests','quest_progress','rewards');
-- RLS aktif semua
select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in
('players','game_sessions','player_positions','quests','quest_progress','rewards');
-- Fungsi ada, hanya service_role boleh eksekusi (cek manual di Database > Functions)
-- Tidak ada policy tulis rewards untuk authenticated (anti-cheat)
select policyname, cmd, roles from pg_policies where tablename='rewards';
```

Hasil harapan: 6 baris tiap cek tabel; `rowsecurity = true`; `rewards` hanya policy `SELECT`.

## 4. Rollback (HANYA dengan persetujuan eksplisit — operasi destruktif)

Urutan balik `0004 → 0001` (drop function dulu, baru tabel). Tulis perintahnya saat dibutuhkan,
jangan disiapkan permanen di repo agar tak terpencet.

## 5. Yang DILARANG

- Apply ke database production BahasaCerdas dalam keadaan apapun.
- Menaruh `SUPABASE_SERVICE_ROLE_KEY` / nilai secret apapun di git, `.env` yang di-commit, atau screenshot.
- Meneruskan migrasi `0005+` (kontrak baru) sebelum `CONTRACT_PROPOSAL_002` disetujui frontend.
