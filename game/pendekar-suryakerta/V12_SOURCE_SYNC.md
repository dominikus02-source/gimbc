# Sinkronisasi Sumber V12

## Keadaan
Arsip sumber inti V12 sudah tersedia di lingkungan kerja, tetapi konektor GitHub yang tersedia untuk repository ini hanya menerima isi teks/base64 sebagai payload dan tidak memiliki operasi unggah berkas lokal secara langsung.

Saya sengaja **tidak** membuat arsip palsu, potongan base64 yang tidak lengkap, atau mengklaim source sudah tersinkron.

## Yang sudah ada di branch
- shell aplikasi permainan
- `package.json`
- HUD Bahasa Indonesia
- baseline UI/UX
- panduan pengecekan lokal
- checkpoint V12

## Target sinkronisasi
Folder target:
`game/pendekar-suryakerta/web/`

Source inti yang harus masuk:
- `src/game/GameApp.tsx`
- `src/game/Overlay.tsx`
- `src/game/scene.tsx`
- `src/game/sim.ts`
- `src/game/input.ts`
- `src/game/audio.ts`
- `src/game/relics.ts`
- `src/game/save.ts`
- `src/game/hud.ts`
- `src/main.tsx`
- `src/styles.css`
- konfigurasi Vite/TypeScript/package

## Aturan
Jangan menjalankan atau menyatakan V12 sebagai versi yang dapat dicek dari GitHub sampai seluruh source inti tersebut benar-benar ada di branch.
