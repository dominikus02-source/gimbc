# Cara Cek di Laptop — Pendekar Suryakerta

Branch permainan:
`feat/pendekar-suryakerta-arcade-v03`

## Jalankan lokal

```bash
git clone -b feat/pendekar-suryakerta-arcade-v03 https://github.com/dominikus02-source/gimbc.git
cd gimbc/game/pendekar-suryakerta/web
npm install
npm run dev
```

Buka alamat pengembangan yang ditampilkan Vite.

## Pemeriksaan wajib

```bash
npm run typecheck
npm run build
```

## Alur uji

1. Mulai pertarungan.
2. Gerakkan pendekar dengan WASD atau tombol panah.
3. Serang dan pastikan kombo bertambah saat serangan mengenai musuh.
4. Gunakan Lari Cepat dan tiga Jurus.
5. Selesaikan gelombang dan pilih peninggalan.
6. Uji telegrap serangan Shade dan Wisp.
7. Hadapi Penjaga Besar dan perhatikan perubahan fasenya.
8. Uji kalah lalu Main Lagi.
9. Uji tampilan pada layar sempit/touch.

## Catatan

Aplikasi BahasaCerdas utama tidak disentuh. Semua pekerjaan gim berada di folder `game/pendekar-suryakerta` pada branch eksperimen ini.
