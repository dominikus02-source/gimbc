# Web Build — Pendekar Suryakerta

Status: IN PROGRESS

## Target
Menjalankan versi 3D Grok asli sebagai permainan mandiri, terpisah dari BahasaCerdas.

## Yang sudah dikerjakan lokal
- Basis permainan tetap menggunakan `src/game/GameApp.tsx`, `scene.tsx`, `sim.ts`, `Overlay.tsx`.
- Dibuat cangkang Vite mandiri agar tidak bergantung pada TanStack Start/Auth/Grok runtime.
- Entry browser baru: `src/main.tsx`.
- Konfigurasi Vite/Tailwind mandiri.
- Alias aplikasi pada Overlay diubah menjadi import relatif agar cangkang mandiri dapat dibangun.
- Teks antarmuka utama mulai dinaturalisasi ke Bahasa Indonesia.
- Sumber lokal sudah dikemas dan hash arsip tervalidasi:
  `999df816a7082625e2834d74c6e31a2211b5c0cebd4afe9593654bb2158c4767`.

## Gate berikutnya
1. Memindahkan seluruh sumber 3D secara utuh ke branch ini tanpa korupsi.
2. Instal dependensi bersih.
3. Typecheck.
4. Build produksi.
5. Uji browser desktop + sentuh.
6. Uji performa dan error runtime.
7. Baru pasang URL uji terpisah dan sambungkan dari Lab Permainan BC.

## Aturan
- Tidak menyentuh branch `main` BahasaCerdas.
- Tidak mengganti permainan 3D dengan prototipe 2D.
- Tidak menyatakan siap sebelum build dan permainan benar-benar dapat diuji.
