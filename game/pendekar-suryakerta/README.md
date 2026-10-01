# Pendekar Suryakerta — Arcade Lab

Pengembangan terisolasi untuk **Pendekar Suryakerta** sebagai gim aksi arena 3D.

## Batas aman
- Tidak menyentuh aplikasi utama BahasaCerdas.
- Tidak mengubah branch utama.
- Sumber gim berada di `game/pendekar-suryakerta/web`.
- Dependency lokal tidak disimpan di Git.

## Isi vertical slice
- Arena 3D dengan pencahayaan sinematik.
- Pendekar, tiga tipe musuh, dan Penjaga Besar.
- Gelombang bertahap dengan variasi tekanan.
- Serangan berantai, Tebas, Jurus, Jerat, dan Lari Cepat.
- Penghindaran sempurna, telegrap serangan, efek benturan, angka kerusakan, dan kombo.
- Pilihan peninggalan setelah gelombang.
- Tingkat, jiwa, pemulihan, rekor lokal, dan layar kalah.
- Kendali papan ketik, tetikus, layar sentuh, dan gamepad.
- Antarmuka pemain berbahasa Indonesia.

## Menjalankan
Masuk ke `game/pendekar-suryakerta/web`, lalu:

```bash
npm install
npm run dev
```

Buka `http://localhost:8080`.

## Catatan pemeriksaan
Pemeriksaan statis permainan sudah dijalankan pada workspace pengembangan. Pemasangan dependency dan build Vite penuh tetap perlu dijalankan pada lingkungan yang memiliki akses paket npm.
