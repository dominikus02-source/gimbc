# APPROVAL REQUEST 001 — Paket Backend (satu halaman, tinggal checklist)

> Untuk: Teamleader
> Dari: Sugeng Riyanto (Backend)
> Branch: `feat/backend-contracts-baseline-draft`
> Status: **Menunggu keputusan. JANGAN merge / apply ke Supabase sebelum semua kotak Bagian 5 dicentang.**
> Cara approve: centang per kotak (`Setuju` / `Ubah: ...`), lalu Approve / Request Changes di PR.

---

## 1. Objective

Kunci fondasi backend sekali jalan agar tidak bolak-balik: 6 tabel persis kontrak, RLS aman, env + spek API jelas. Tanpa tabel khayalan, tanpa secret, tanpa sentuh production.

## 2. Isi paket (7 file, 1 PR)

| # | File | Isi singkat |
|---|------|-------------|
| 1 | `docs/BACKEND_SCHEMA_DRAFT.md` | Draf pemetaan 1:1 kontrak → SQL + 8 pertanyaan awal (Q1–Q8) |
| 2 | `supabase/migrations/0001_baseline.sql` | Migrasi final baseline: 6 tabel, RLS ON deny-by-default |
| 3 | `supabase/migrations/0002_rls_phase5.sql` | Policy RLS: pemilik kelola miliknya, rewards read-only (anti-cheat) |
| 4 | `.env.example` | Nama variabel saja (usulan shared, tanpa nilai) |
| 5 | `docs/BACKEND_API_SPEC.md` | DRAFT endpoint server-validated (jawab → grant reward 1 transaksi) |
| 6 | `docs/BACKEND_PHASE5_PREP.md` | Checklist setup Supabase + urutan eksekusi |
| 7 | File ini | Halaman approval tunggal |

## 3. Yang sengaja TIDAK ada (butuh kontrak baru + agree frontend)

Tabel `avatars/npcs/challenges/monsters/inventory` — disebut di `docs/GAME_DESIGN.md:5-21` tapi belum di `docs/CONTRACTS.md`. Aturan: `docs/CONTRACTS.md:99-104`.

## 4. Keputusan backend yang sudah dikunci (milik backend per `CONTRACTS.md:5`, `TEAM_WORKFLOW.md:46,67`)

- PK `player_positions` = komposit `(session_id, player_id)` (kontrak tanpa `id`).
- Kolom DB `sort_order`, API tetap `order` (tanpa breaking change).
- Default `gen_random_uuid()` + `now()`, CHECK wajar, `UNIQUE(player_id, quest_id)`.
- RLS deny-by-default; `service_role` hanya server-side (`docs/ARCHITECTURE.md:37-39`).

## 5. Checklist TL (tinggal centang)

### A. Migrasi baseline (`0001`)
- [ ] A1. Setuju 6 tabel 1:1 kontrak, tanpa tabel tambahan? (___)
- [ ] A2. Setuju PK komposit + `sort_order` + default + CHECK + UNIQUE? (___)

### B. RLS + anti-cheat (`0002`)
- [ ] B1. Setuju rewards read-only dari client, grant via server? (___)
- [ ] B2. Setuju quest hanya bisa `insert active`, complete via server? (___)
- [ ] B3. Setuju posisi: baca sync + tulis milik sendiri (max 30/instance)? (___)

### C. Env + API + rencana
- [ ] C1. Setuju nama env di `.env.example` (nilai via secret manager, bukan git)? (___)
- [ ] C2. Setuju spek API server-validated (client tak kirim xp/coins sendiri)? (___)
- [ ] C3. Setuju metode auth game-local: email/password dulu? (___)

### D. Final
- [ ] D1. Setuju lokasi `supabase/migrations/`? (___)
- [ ] D2. Boleh merge PR ini ke `main` setelah semua di atas `Setuju`? (___)

## 6. Output setelah semua `Setuju`

- [ ] Merge PR → baseline terkunci, tidak diubah lagi.
- [ ] Apply `0001` + `0002` ke project Supabase game (manual, oleh backend).
- [ ] Lanjut: policy lanjutan + implementasi API Phase 5 + usulan kontrak baru sebagai issue.

## 7. Referensi

`docs/CONTRACTS.md:15-97` (6 kontrak), `:99-104` (aturan ubah) · `docs/ARCHITECTURE.md:35` (auth game-local), `:37-39` (no service-role frontend) · `docs/CONTEXT.md:24` (30/instance) · `docs/IMPLEMENTATION_PLAN.md:75-85` (Phase 5) · `TEAM_WORKFLOW.md:46,67`.

## 8. Verifikasi pengaju

- [x] Tanpa secret, tanpa akses production
- [x] 1 PR 1 paket backend, branch terpisah dari frontend
- [ ] Menunggu checklist A–D TL
