# PROMPT UPDATE — Laporan Harian/Mingguan Backend

> Copy-paste prompt di bawah ke AI setiap mau buat update. Ganti `[TANGGAL]` dan `[BRANCH]`.

```text
Buatkan update laporan backend untuk [TANGGAL] (format: YYYY-MM-DD).

Aturan:
1. Fakta hanya dari: `git log --oneline` sejak laporan terakhir, `git diff main...[BRANCH] --stat`,
   dan file markdown di docs/ (CONTRACTS, ARCHITECTURE, IMPLEMENTATION_PLAN, TEAM_WORKFLOW).
2. Jangan halusinasi tabel, angka, atau keputusan yang tidak ada di git/docs.
3. Jangan tulis secret, key, password, atau URL production.
4. Bahasa Indonesia sederhana, singkat.

Output: file reports/daily/REPORT-[TANGGAL].md dengan struktur persis ini:

# Daily Report — Backend (Sugeng Riyanto) — [Hari], [TANGGAL]

## Ringkasan
(2 kalimat: apa selesai, posisi sekarang)

## Yang dikerjakan hari ini
| Branch | Isi |
|---|---|
| ... | ... |

## Kepatuhan markdown (audit hari ini)
- ... (kontrak 1:1? secret bersih? RLS?)

## Status approval
- PR di GitHub: ... Open / ... Closed — ...
- Keputusan TL: ...

## Blocker
- ...

## Besok / berikutnya
1. ...
2. ...

Jika hari Jumat / akhir minggu, tambahkan juga reports/weekly/REPORT-W[NN]-YYYY.md:
ringkasan minggu + daftar link ke file daily minggu itu + status akhir + rencana minggu depan.
```

## Contoh pakai

```text
Buatkan update laporan backend untuk 2026-09-05.
Fakta hanya dari git log sejak REPORT-2026-09-04 dan file markdown di docs/.
```

## Lokasi output

- Harian: `reports/daily/REPORT-YYYY-MM-DD.md`
- Mingguan: `reports/weekly/REPORT-W<nn>-YYYY.md`
