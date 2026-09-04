# BACKEND AUTH RECOMMENDATION — Phase 5 game-local only (REKOMENDASI, bukan keputusan)

> Status: REKOMENDASI backend. Butuh 1 centang TL sebelum di-wire.
> Dasar: `docs/ARCHITECTURE.md:35` (game-local email/password, magic link, atau sejenis;
> SSO production ditunda), Phase 5 "auth works (even if basic)" (`docs/IMPLEMENTATION_PLAN.md:75-85`).
> RLS `0002` + fungsi `0003`/`0004` sudah ditulis dengan asumsi `players.id = auth.users.id`.

## Opsi (hanya yang disebut markdown)

| Opsi | Plus | Minus |
|---|---|---|
| A. Email/password | Paling basic, cocok "even if basic"; anak bisa pakai akun orang tua; tanpa ketergantungan inbox saat main | Kelola password (reset via email tetap perlu) |
| B. Magic link | Tanpa password | Wajib buka inbox tiap login — berat untuk anak di mobile/web sekolah |

## Rekomendasi backend: Opsi A (email/password) untuk Phase 5

Alasan: paling sederhana, sesuai "basic", RLS tak peduli metode (hanya `auth.uid()`),
ganti ke magic link nanti tanpa ubah schema/RLS/fungsi.

## Minta 1 keputusan TL

- [ ] Setuju email/password untuk Phase 5? (___) Jika tidak, tulis opsinya: ___
