# Pendekar Suryakerta — Port Grok v05

## Baseline

Fondasi permainan berasal dari proyek Grok yang diberikan untuk eksperimen ini.

Mesin utama yang dipertahankan:
- `src/game/sim.ts`
- `src/game/input.ts`
- `src/game/audio.ts`
- `src/game/relics.ts`
- `src/game/save.ts`
- `src/game/hud.ts`

Lapisan tampilan:
- React
- Three.js
- React Three Fiber
- Drei

## Adaptasi Pendekar

`scene.tsx` diubah pada tampilan pemain:
- ksatria diganti menjadi pendekar
- kepala, ikat kepala, rambut, pakaian, selendang, kaki, dan pedang dibuat sebagai model low-poly dari geometri Three.js
- gerak dasar diberi bob/stride agar tidak terasa seperti benda diam
- selendang bereaksi terhadap gerakan
- ayunan pedang mengikuti timing serangan mesin Grok

Arena mempertahankan struktur permainan Grok, tetapi palet utama diarahkan ke identitas Pendekar Suryakerta.

Antarmuka permainan dilokalkan ke Bahasa Indonesia pada port ini.

## Paket uji lokal

Arsip:
`Pendekar-Suryakerta-Grok-Port-v05-real.zip`

SHA-256:
`e243563e9d03de76e5aebcefbae2d20cdf0f066476fb845b40bb8c01eb2e0831`

Pemeriksaan arsip:
- ZIP valid
- seluruh entri dapat dibaca
- tidak ada error kompresi

## Menjalankan

```bash
npm install
npm run dev
```

Pemeriksaan setelah dependency tersedia:

```bash
npm run typecheck
npm run build
```

## Catatan

Lingkungan pengembangan ChatGPT mengalami batas waktu saat `npm install`, sehingga hasil build/typecheck belum boleh dianggap PASS dari lingkungan ini.

Jangan gabungkan ke `main` sebelum port dimainkan dan build lokal/CI PASS.
