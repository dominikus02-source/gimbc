# BACKEND DIAGRAMS — alur visual (Mermaid, render otomatis di GitHub)

> Sumber: `CONTEXT.md` (core loop), `CONTRACTS.md` (status), migrasi `0001–0006`.

## 1. Core loop + penegakan backend

```mermaid
flowchart LR
  A[ENTER join_instance] --> B[EXPLORE positions]
  B --> C[MEET NPC quests]
  C --> D[START start_quest]
  D --> E[ANSWER complete_quest]
  E --> F[REWARD xp coin]
  F --> G[PROGRESS]
  G --> B
```

## 2. Siklus quest (`active → completed / failed`)

```mermaid
stateDiagram-v2
  [*] --> active: start_quest, level cukup
  active --> completed: complete_quest benar
  active --> failed: complete_quest salah
  completed --> [*]
  failed --> [*]
```

## 3. Keputusan tulis posisi (RLS 0005)

```mermaid
flowchart TD
  W[Tulis posisi] --> A{auth.uid = player_id?}
  A -- Tidak --> D[DITOLAK 42501]
  A -- Ya --> B{Sesi milik sendiri + aktif?}
  B -- Tidak --> D
  B -- Ya --> OK[DIIZINKAN]
```

## 4. Urutan migrasi + CI

```mermaid
flowchart TD
  M1[0001 tabel] --> M2[0002 RLS]
  M2 --> M3[0003 complete_quest]
  M3 --> M4[0004 join leave cap30]
  M4 --> M5[0005 hardening + 8 tests]
  M5 --> M6[0006 start_quest + 6 tests]
  M5 --> CI[CI pgTAP GREEN]
  M6 --> CI
```

## 5. Lapisan RBAC

```mermaid
flowchart TD
  Client[Client authenticated] --> RLS[RLS: baca milik sendiri]
  Client --> API[Server API service_role]
  API --> F[Fungsi: update_profile, start-quest, complete-quest, join-leave]
  F --> DB[(6 tabel)]
  RLS --> DB
```
