# BACKEND STATUS BOARD — posisi terkini (diupdate tiap merge)

[![backend-sql-tests](https://github.com/dominikus02-source/gimbc/actions/workflows/backend-sql-tests.yml/badge.svg)](https://github.com/dominikus02-source/gimbc/actions/workflows/backend-sql-tests.yml)

> `main` saat ini: migrasi `0001–0005` + CI hijau. Kontrak: 6 tabel 1:1 `CONTRACTS.md`.

## Paket (urut merge)

| Paket | Isi | Status |
|---|---|---|
| 1. Baseline | `0001` 6 tabel, `0002` RLS, env, API spec, prep | ✅ main |
| 2. Grant reward | `0003` `complete_quest` anti-cheat | ✅ main |
| 3. Instances | `0004` join/leave + cap 30 | ✅ main |
| 4. Proposal 002 | Avatar/NPC/Challenge/Monster/Inventory (dokumen) | ✅ main (proposal) |
| 5. Runbook | apply 0001→0004 + verifikasi | ✅ main |
| 6. Security final | `0005` server-owned players + EXISTS session + 8 tests | ✅ main, CI hijau |
| 7. CI | workflow + stub, hijau tiap push | ✅ main |
| 8. Function tests | 14 tests `complete_quest`/`update_profile`/join/leave | ✅ main (merge Dominikus), CI hijau |
| 9. Integrasi frontend | `FRONTEND_INTEGRATION.md` | ✅ main (merge Dominikus) |
| 10. Auth | rekomendasi email/password | ✅ main (dokumen); method butuh 1 centang TL |
| 11. Realtime notes | channel `instance:{id}` (usulan) | ✅ main (dokumen); butuh agree frontend |
| 12. RBAC CRUD | `0006` `start_quest` + level-gate + matriks + 6 tests | ⏳ branch `feat/backend-0006-rbac-crud`, CI hijau |
| 13. Reports | daily/weekly + template | ✅ main (merge Dominikus) |

## Keputusan terbuka (pemilik)

- Auth method: TL · Kontrak 002 + channel + env: frontend · Apply ke Supabase DEV: backend (butuh project)
- Aturan: kontrak baru ikut `CONTRACTS.md:99-104`; `main` stabil; PR per paket.
