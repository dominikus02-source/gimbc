# RESPONS TL 002 — Penutup 2 security blocker (kirim ulang final approval)

> Branch: `feat/backend-0005-security-hardening` (dari `main` setelah Paket 1–5).
> Cara final approval: cek 2 file migrasi+test di bawah, lalu Approve.

## Blocker 1 — players server-owned ✅ ditutup

- Hapus: `players_owner_update` dan `players_owner_insert` (insert dihapus juga karena
  lubang sekelas: signup bisa set `level=99` — eksplisit, bisa veto).
- Tambah: fungsi `update_profile()` (`SECURITY DEFINER`, hanya `service_role`) untuk
  mutasi `username/avatarId` via server API; `PATCH /api/player/me` memanggil ini.
- Tambah: trigger `handle_new_user` — profil dibuat otomatis saat signup dengan
  default aman (`level=1, xp=0, coins=0`).
- Test: T1–T4 (`throws_ok 42501` untuk UPDATE `level/xp/coins/username`) + T8
  (authenticated tak bisa eksekusi `update_profile`).

## Blocker 2 — validasi pasangan session/player ✅ ditutup

- Policy `pp_owner_write`/`pp_owner_update` diganti: wajib `EXISTS` ke
  `game_sessions` (`id = session_id AND player_id = auth.uid() AND ended_at IS NULL`).
- Berlaku INSERT dan UPDATE (Using + With Check).
- Test: T5 (Alice→sesi Alice ALLOWED), T6 (Alice→sesi Bob DENIED),
  T7 (pindahkan baris ke sesi Bob DENIED).

## Yang disetujui TL — tidak diubah ✅

6 tabel, composite PK, `sort_order`, UUID/now defaults, CHECK, deny-by-default,
reward/quest server-side, tanpa tabel baru — semua tetap seperti di-approve.

## File

- `supabase/migrations/0005_security_hardening.sql`
- `supabase/tests/0005_security_tests.sql` (pgTAP, 8 test, rollback otomatis)
- Update kecil: `BACKEND_API_SPEC.md` (PATCH via `update_profile`),
  `BACKEND_MIGRATION_RUNBOOK.md` (urutan 0001→0005 + langkah run test).

## Cara run test (project game DEV)

1. Apply `0001`→`0005` via SQL Editor.
2. `create extension if not exists pgtap;`
3. Paste isi `0005_security_tests.sql` → Run. GREEN = 8/8 ok tanpa error.
