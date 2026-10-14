# Perubahan (versi final)

## Keamanan (backend `api/Code.gs`)
- Semua action data kini memerlukan token; `students`, `sensei`, `*Save`, `*Delete` hanya ADMIN.
- Secret token terpisah (`ARIMA_TOKEN_SECRET`, acak, di Script Properties). Konstanta `ARIMA_SECRET_2026` dihapus dari kode.
- Perbandingan token dan hash password constant-time.
- Pesan login seragam + batas 5 percobaan gagal / 15 menit per ID.
- `LockService` pada semua operasi tulis.
- `setupInitialAdmin()` membuat password acak (tidak lagi `admin123`); `testLogin()` dihapus.

## Fitur
- Rincian absensi setelah menyimpan (durasi & JP untuk sensei).
- Halaman **Kwitansi**: daftar pembayaran, cari, cetak PDF (dengan terbilang), kirim WhatsApp.
- Menu admin (Siswa, Sensei, Kwitansi, dst.) disembunyikan untuk non-admin.

## Kebersihan repo
- Salinan ganda di root (`app.js`, `Code.gs`, `style.css`, dst.) dan `api/Code.gs.new` dihapus.

## Deploy
1. Tempel `api/Code.gs` ke proyek Apps Script, Deploy > Manage deployments > New version.
2. Unggah semua file lain ke GitHub (Vercel deploy otomatis), lalu Ctrl+Shift+R.
3. Semua sesi login lama otomatis keluar sekali (secret token baru).
