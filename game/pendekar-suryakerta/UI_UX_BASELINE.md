# UI/UX BASELINE — PENDEKAR SURYAKERTA

## Tujuan
Membangun antarmuka permainan 3D yang mengambil prinsip UX prototipe Grok: dunia permainan tetap menjadi fokus utama, HUD ringan, informasi penting selalu terlihat, dan kontrol desktop/mobile terasa alami.

Ini adalah inspirasi pola interaksi, bukan penyalinan merek, aset, atau identitas visual Grok.

## Prinsip Utama
1. Dunia permainan adalah prioritas; HUD tidak menutupi karakter, musuh, atau arena.
2. Nyawa, stamina, level, gelombang, dan kondisi permainan terlihat tanpa membuka halaman lain.
3. HUD tenang: panel gelap transparan, garis tepi halus, tipografi kuat, ornamen minimal.
4. Aksi terasa langsung: serang, dash, jurus, dan jeda memberi respons visual segera.
5. Desktop dan mobile setara untuk fungsi inti.
6. Semua teks pemain menggunakan Bahasa Indonesia.
7. Jangan menambah fitur hanya demi ramai; setiap elemen harus punya fungsi permainan.

## Tata Letak Desktop
- Kiri atas: nyawa, stamina, level, pengalaman bila relevan.
- Kanan atas: gelombang, jeda, status permainan bila diperlukan.
- Kanan tengah: kombo; tampil saat aktif dan hilang perlahan setelah jeda.
- Kiri bawah: kemampuan dan indikator waktu tunggu.
- Kanan bawah: suara atau kontrol tambahan yang benar-benar diperlukan.

## Tata Letak Mobile
Gunakan area aman perangkat.
- Kiri atas: nyawa, stamina, level.
- Kanan atas: gelombang dan jeda.
- Kiri bawah: tongkat kendali virtual.
- Kanan bawah: serang, dash, jurus.
- Target sentuh utama minimal sekitar 56px.

## Layar Awal
Komposisi sederhana:
**PENDEKAR SURYAKERTA**

_Subjudul singkat yang membangun suasana._

Tombol utama:
**Mulai Pertarungan**

Pilihan tambahan hanya jika memang tersedia: Suara, Cara Bermain.

## Keadaan Permainan
- Mulai: satu tindakan utama membawa pemain ke arena.
- Gelombang dimulai: banner singkat seperti **GELOMBANG 1**.
- Bermain: HUD minimal.
- Terkena serangan: kilatan/vignette singkat dan perubahan indikator nyawa.
- Kombo: muncul dekat area aksi, bukan menutupi pusat pandangan.
- Jeda: Lanjutkan, Mulai Ulang, Kembali.
- Kalah: gelombang terakhir, skor, kombo terbaik, Main Lagi.

## Bahasa Visual
- Latar sangat gelap.
- Permukaan panel gelap transparan.
- Teks utama terang hangat.
- Teks sekunder abu-abu.
- Aksen netral/jade-baja.
- Nyawa merah hangat.
- Stamina biru-abu.
- Warna dipakai sebagai informasi, bukan dekorasi.

Radius:
- Kontrol kecil 8–12px.
- Panel 12–16px.
- Modal 16–24px.

## Tipografi
- Judul: kuat dan sinematik.
- HUD: sans-serif modern dan mudah dibaca.
- Angka kondisi: kontras tinggi.
- Hindari terlalu banyak jenis huruf.

## Gerakan dan Umpan Balik
- Perubahan HUD kecil: sekitar 120–180ms.
- Banner masuk cepat, tahan singkat, lalu keluar halus.
- Kombo muncul cepat dan menghilang setelah tidak aktif.
- Tombol memberi umpan balik tekan yang jelas.
- Respons serangan diprioritaskan pada karakter dan efek benturan, bukan animasi UI.
- Dukung gerakan yang dikurangi.

## Kontrol
Desktop:
- WASD / tombol panah untuk bergerak.
- Tombol aksi konsisten dan terdokumentasi.
- Tombol aksi utama dapat menggunakan Spasi bila sesuai rancangan.

Mobile:
- Tongkat virtual untuk gerak.
- Tombol sentuh untuk aksi.
- Gunakan pointer capture agar kontrol tidak mudah terlepas.

## Aturan Responsif
- Tidak ada elemen penting yang keluar layar pada rasio 16:9, 19.5:9, atau layar sempit.
- Gunakan safe-area inset pada perangkat dengan poni/notch.
- HUD tidak boleh menutupi karakter dalam permainan normal.
- Tombol sentuh tidak boleh bertabrakan.
- Orientasi yang didukung tetap dapat dimainkan tanpa memotong kontrol.

## Aksesibilitas
- Kontras teks utama kuat.
- Jangan menggunakan warna sebagai satu-satunya penanda kondisi.
- Tombol aksi memiliki label/aria yang jelas.
- Mode gerakan dikurangi menghentikan animasi kosmetik yang tidak diperlukan.
- Teks tetap mudah dibaca pada layar kecil.

## Batasan Produk
Jangan memasukkan panel statistik yang tidak dibutuhkan saat bertarung, menu panjang di tengah permainan, notifikasi yang menutupi arena, ornamen UI tanpa fungsi, bahasa Inggris pada teks pemain, atau fitur sosial/ekonomi sebelum inti permainan terasa solid.

## Kriteria Penerimaan
- [ ] Kondisi karakter dapat dipahami kurang dari satu detik.
- [ ] Gelombang aktif terlihat tanpa membuka menu.
- [ ] Tombol jeda mudah ditemukan.
- [ ] Kontrol mobile tidak menutupi karakter.
- [ ] Semua aksi utama mendapat umpan balik visual.
- [ ] Layar awal menuju pertarungan dengan satu tindakan utama.
- [ ] Layar kalah memungkinkan langsung bermain lagi.
- [ ] UI tidak mengganggu keterbacaan arena.
- [ ] Semua teks pemain berbahasa Indonesia.
- [ ] Desktop dan mobile melewati uji interaksi dasar.
- [ ] Tidak ada perubahan pada aplikasi BahasaCerdas utama.

## Urutan Implementasi
1. Terapkan struktur HUD.
2. Rapikan kontrol mobile.
3. Terapkan layar awal.
4. Rapikan keadaan jeda/kalah.
5. Tambahkan transisi mikro dan umpan balik serangan.
6. Uji rasio desktop dan mobile.
7. Uji alur mulai → gelombang → kalah → main lagi.
8. Baru kemudian poles efek, audio, dan aset.

Dokumen ini menjadi baseline UI/UX untuk eksperimen Pendekar Suryakerta pada branch permainan terisolasi.
