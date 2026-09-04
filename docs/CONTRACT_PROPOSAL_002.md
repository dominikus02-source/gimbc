# CONTRACT PROPOSAL 002 — Avatar, NPC, Challenge, Monster, Inventory (DRAFT)

> Status: **PROPOSAL. Bukan kontrak resmi. TANPA tabel/SQL.**
> Butuh review + persetujuan frontend (Dominikus) sebelum jadi kontrak dan tabel
> (`docs/CONTRACTS.md:99-104`). Backend tidak akan buat tabelnya sebelum itu.
> Alasan: entitas ini didefinisikan di `docs/GAME_DESIGN.md:5-21` dan inventory
> disyaratkan Phase 5 (`docs/IMPLEMENTATION_PLAN.md:75-85`), tapi belum ada di kontrak.

## 1. Avatar — dari `GAME_DESIGN.md:8-9` (representasi visual, customizable)

```typescript
interface Avatar {
  id: string;              // UUID, dirujuk Player.avatarId (CONTRACTS.md:20)
  name: string;
  modelUrl: string | null; // GLB/GLTF via R3F client (ARCHITECTURE.md:8-10); null = placeholder Phase 1-2
}
```

Open: field kustomisasi apa saja (warna, aksesori)? Tunggu kebutuhan frontend avatar Phase 3 (`IMPLEMENTATION_PLAN.md:47-58`).

## 2. NPC — dari `GAME_DESIGN.md:11-12` (dialog, peran, pemberi quest)

```typescript
interface NPC {
  id: string;              // UUID; Quest.npcId merujuk ini (CONTRACTS.md:62)
  name: string;
  role: string;            // cth. "teacher", "fisher" — daftar peran butuh agree
  worldId: string;         // zona Bahasa Village (WORLD_DESIGN.md:9-20)
  dialogueId: string | null; // sistem dialog Phase 3; null = belum ada
}
```

Open: struktur dialog (tree vs linear) diputuskan bersama saat Phase 3.

## 3. Challenge — dari `GAME_DESIGN.md:14-18` (aktivitas belajar, awalnya Q&A, terikat quest+NPC)

```typescript
interface Challenge {
  id: string;              // UUID
  questId: string | null;  // terikat quest (GAME_DESIGN.md:18); null = tantangan bebas/moster
  npcId: string | null;    // presenter (GAME_DESIGN.md:18)
  type: "qa";              // MVP hanya Q&A; tipe lain ditambah via kontrak baru
  prompt: string;          // pertanyaan Bahasa Indonesia
}
```

Open: bentuk jawaban + penilaian (pilihan ganda vs isian) dan bank soal kurikulum = Phase 7
(`IMPLEMENTATION_PLAN.md:102-114`). Proposal ini sengaja TIDAK memuat skema jawaban agar tak mengarang kurikulum.

## 4. Monster — dari `GAME_DESIGN.md:20-21` (rintangan; encounter picu challenge; kalahkan dapat reward)

```typescript
interface Monster {
  id: string;              // UUID
  name: string;
  worldId: string;         // zona spawn: Forest/Arena/Monster Area (WORLD_DESIGN.md:9-20)
  challengeId: string;     // challenge yang dipicu saat encounter
  xpReward: number;
  coinReward: number;
}
```

Open: spawn rate, perilaku, boss fight = Phase 4+ (`IMPLEMENTATION_PLAN.md:60-72`).

## 5. Inventory — dari `IMPLEMENTATION_PLAN.md:75-85` (Phase 5: inventory persists)

```typescript
interface Item {
  id: string;              // UUID; dirujuk Reward.itemId (CONTRACTS.md:93)
  name: string;
  kind: "cosmetic" | "consumable" | "lore"; // premium eksplisit out-of-scope Phase 0-7 (GAME_DESIGN.md:57-62)
}

interface InventoryItem {
  playerId: string;        // References Player.id
  itemId: string;          // References Item.id
  qty: number;
  acquiredAt: string;      // ISO 8601
}
```

Open: apakah item bisa diperjualbelikan/dipakai habis? Butuh keputusan produk (shared).

## 6. Yang TIDAK diusulkan di sini

- Rumus level/XP adaptif + analitik belajar = Phase 7, butuh kurikulum.
- Billing/premium = Phase 8, out-of-scope.
- Tabel/SQL apapun — dibuat HANYA setelah proposal ini jadi kontrak resmi.

## 7. Minta keputusan (frontend + TL)

- [ ] Setuju 5 entitas di atas masuk `CONTRACTS.md` (dengan penyesuaian)?
- [ ] Setuju `Challenge` minimal dulu (tanpa skema jawaban) sampai Phase 7?
- [ ] Setuju `Item.kind` di atas (tanpa premium)?
- [ ] Setelah setuju: backend buat migrasi `0005_*` + update kontrak resmi dalam PR terpisah.
