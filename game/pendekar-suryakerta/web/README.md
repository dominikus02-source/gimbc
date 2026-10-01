# Pendekar Suryakerta — Arena

Gim aksi arena 3D mandiri berbasis React, Three.js, dan Vite.

## Fokus permainan

- Pertarungan gelombang demi gelombang.
- Tiga jurus: Jurus, Jerat, dan Tebas.
- Lari cepat dengan mekanik penghindaran sempurna.
- Kombo, efek benturan, angka kerusakan, telegrap serangan, dan Penjaga Besar.
- Pilihan peninggalan yang menyesuaikan kondisi pemain tanpa menjadi deterministik.
- Progres tingkat, jiwa, pemulihan antargelombang, dan penyimpanan rekor lokal.
- Kendali papan ketik, tetikus, layar sentuh, dan gamepad.
- Antarmuka pemain sepenuhnya berbahasa Indonesia.
- Tampilan arena 3D dengan pencahayaan sinematik, HUD minimal, dan panel kaca gelap.

## Menjalankan di laptop

```bash
npm install
npm run dev
```

Buka `http://localhost:8080`.

## Pemeriksaan kualitas

```bash
npm run typecheck
npm run build
node scripts/final-quality-check.mjs
```

Pemeriksaan otomatis permainan tidak menggantikan uji browser. Setelah pemasangan dependensi berhasil, lakukan satu sesi permainan dari halaman awal sampai pilihan peninggalan, kemudian lanjutkan sampai Penjaga Besar.
