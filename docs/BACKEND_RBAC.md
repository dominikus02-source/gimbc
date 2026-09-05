# BACKEND RBAC MATRIX — siapa boleh apa (sumber: policy 0002/0005/0006)

> Peran Supabase: `anon` (belum login) · `authenticated` (login game-local) ·
> `service_role` (server-side saja, tak pernah ke frontend).
> Legenda: ✅ boleh · ❌ ditolak RLS · 🔌 hanya via fungsi server.

## players

| Aksi | anon | authenticated | service_role |
|---|---|---|---|
| SELECT milik sendiri | ❌ | ✅ | ✅ |
| UPDATE langsung | ❌ | ❌ (0005) | ✅ |
| INSERT langsung | ❌ | ❌ (0005) | ✅ |
| Ubah username/avatarId | — | 🔌 `update_profile()` | ✅ |
| Buat profil signup | — | otomatis (trigger) | ✅ |

## quests

| Aksi | anon | authenticated | service_role |
|---|---|---|---|
| SELECT (semua) | ❌ | ✅ | ✅ |
| INSERT/UPDATE/DELETE | ❌ | ❌ | ✅ (konten via migrasi/seed) |

## quest_progress

| Aksi | anon | authenticated | service_role |
|---|---|---|---|
| SELECT milik sendiri | ❌ | ✅ | ✅ |
| INSERT `active` | ❌ | ✅ jika level cukup (0006 gate) | ✅ |
| INSERT level kurang | ❌ | ❌ | ✅ |
| Mulai quest | — | 🔌 `start_quest()` (cek level + duplikat) | ✅ |
| complete/failed | ❌ | ❌ | 🔌 `complete_quest()` |

## rewards

| Aksi | anon | authenticated | service_role |
|---|---|---|---|
| SELECT milik sendiri | ❌ | ✅ | ✅ |
| INSERT/UPDATE/DELETE | ❌ | ❌ | 🔌 via `complete_quest()` |

## game_sessions

| Aksi | anon | authenticated | service_role |
|---|---|---|---|
| SELECT | ❌ | ✅ | ✅ |
| join/leave | ❌ | 🔌 `join_instance()`/`leave_instance()` (cap 30) | ✅ |

## player_positions

| Aksi | anon | authenticated | service_role |
|---|---|---|---|
| SELECT (sync) | ❌ | ✅ | ✅ |
| INSERT/UPDATE | ❌ | ✅ milik sendiri + sesi valid (0005 EXISTS) | ✅ |

## Untuk frontend

- Semua tulis sensitif (profil, mulai/selesai quest, reward, sesi) lewat endpoint
  server di `BACKEND_API_SPEC.md` — JANGAN insert/update langsung kecuali yang ✅.
- Butuh peran baru (mis. admin)? Belum ada di markdown — usulkan via kontrak dulu.
