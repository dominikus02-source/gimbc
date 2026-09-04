# APPROVAL SEMUA — Backend Bahasa World (satu file, tinggal checklist)

> Untuk: Teamleader · Dari: Sugeng Riyanto (Backend)
> Cara pakai: buka link file tiap paket, centang kotak, lalu Approve / Request Changes di PR.
> Urutan merge: Paket 1 → 2 → 3 → 4 → 5. Jangan dilompat.
> Repo: `https://github.com/dominikus02-source/gimbc`

## Paket 1 — Fondasi baseline (branch ini, PR pertama)
Halaman detail: `docs/APPROVAL_REQUEST_001_BACKEND_BASELINE.md`

- [ ] P1.1 Schema `0001` 6 tabel 1:1 kontrak — [`0001_baseline.sql`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-contracts-baseline-draft/supabase/migrations/0001_baseline.sql)
- [ ] P1.2 RLS `0002` + rewards read-only — [`0002_rls_phase5.sql`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-contracts-baseline-draft/supabase/migrations/0002_rls_phase5.sql)
- [ ] P1.3 Env + spek API + prep — [`.env.example`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-contracts-baseline-draft/.env.example), [`BACKEND_API_SPEC.md`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-contracts-baseline-draft/docs/BACKEND_API_SPEC.md)
- [ ] P1.4 Checklist Q/A–D di halaman detail sudah semua `Setuju`?
- [ ] P1.5 Boleh merge PR Paket 1 ke `main`? → PR: `/pull/new/feat/backend-contracts-baseline-draft`

## Paket 2 — Fungsi grant reward (setelah P1 merge)
- [ ] P2.1 `complete_quest` atomik anti-cheat, service_role only — [`0003_grant_reward.sql`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-0003-grant-reward/supabase/migrations/0003_grant_reward.sql)
- [ ] P2.2 Setuju `level` tidak diubah (rumus belum ada di markdown)?
- [ ] P2.3 Boleh merge? → PR: `/pull/new/feat/backend-0003-grant-reward`

## Paket 3 — Instance join/leave cap 30 (setelah P2 merge)
- [ ] P3.1 `join_instance`/`leave_instance` + tolak `INSTANCE_FULL` — [`0004_instances.sql`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-0004-instances/supabase/migrations/0004_instances.sql)
- [ ] P3.2 Setuju cabut insert/update langsung client (wajib via server)?
- [ ] P3.3 Boleh merge? → PR: `/pull/new/feat/backend-0004-instances`

## Paket 4 — Proposal kontrak 002 (butuh juga agree frontend)
- [ ] P4.1 5 entitas (Avatar/NPC/Challenge/Monster/Item+Inventory) tanpa tabel — [`CONTRACT_PROPOSAL_002.md`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-contract-proposal-002/docs/CONTRACT_PROPOSAL_002.md)
- [ ] P4.2 Setuju Challenge minimal dulu (tanpa skema jawaban sampai Phase 7)?
- [ ] P4.3 Boleh merge sebagai dokumen proposal? → PR: `/pull/new/feat/backend-contract-proposal-002`

## Paket 5 — Runbook migrasi (setelah P1 merge)
- [ ] P5.1 Urutan apply + verifikasi + larangan production — [`BACKEND_MIGRATION_RUNBOOK.md`](https://github.com/dominikus02-source/gimbc/blob/feat/backend-migration-runbook/docs/BACKEND_MIGRATION_RUNBOOK.md)
- [ ] P5.2 Boleh merge? → PR: `/pull/new/feat/backend-migration-runbook`

## Info saja (tidak butuh approve)
- Laporan: `reports/daily/` + `reports/weekly/` + `reports/PROMPT_UPDATE.md` (branch `chore/backend-weekly-reports`).

## Keputusan akhir
- [ ] Semua P1–P5 di atas `Setuju` / revisi tercatat per item?
