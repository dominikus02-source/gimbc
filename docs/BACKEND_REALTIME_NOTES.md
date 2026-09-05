# BACKEND REALTIME NOTES — Phase 6 (CATATAN DESAIN, bukan implementasi)

> Status: catatan backend untuk persiapan Phase 6. Penamaan channel butuh agree
> frontend (client yang subscribe). Tanpa dedicated game server.
> Dasar: Realtime = transport ringan, bisa diganti (`docs/ARCHITECTURE.md:40-45`);
> max 30/instance (`docs/CONTEXT.md:24`); join/leave via server (`0004_instances.sql`).

## 1. Transport

- Supabase Realtime sebagai prototipe ringan. Abstraksi di client wajib agar bisa diganti
  server khusus tanpa ubah gameplay (`docs/ARCHITECTURE.md:42`).

## 2. Usulan channel (butuh agree frontend)

- Satu channel per instance: `instance:{instanceId}`.
- Event `position`: payload = `PlayerPosition` (`docs/CONTRACTS.md:42-54`).
- Presence untuk daftar 30 pemain + join/leave (server tetap sumber kebenaran sesi via `game_sessions`).

## 3. Keamanan (sudah ditegakkan di migrasi)

- Tulis posisi hanya milik sendiri (`0002`: `pp_owner_write/update`).
- Baca sync saat ini semua-authenticated; pengetatan ke se-instance menyusul saat
  Phase 6 (butuh query keanggotaan sesi — desain bersama frontend).
- Posisi TIDAK dipercaya untuk reward: hanya quest/reward server-authoritative
  (`0003`, `BACKEND_API_SPEC.md`). Teleport/wallhack di luar cakupan Phase 6.

## 4. Bukan di sini (milik frontend / fase lain)

- Tick rate, interpolasi, prediksi gerak: client (Dominikus).
- Dedicated game server: hanya jika Realtime terbukti kurang (keputusan arsitektur bersama).
