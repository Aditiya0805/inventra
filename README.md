# Inventra

**Dashboard Monitoring Aset & Fasilitas Sekolah** — aplikasi web untuk memantau ruangan, aset, peminjaman, kerusakan, mutasi, dan laporan sarana prasarana sekolah dalam satu tempat.

Dibangun dengan **Laravel + Inertia.js + React + Tailwind CSS**, dengan antarmuka berbahasa Indonesia dan data contoh Sekolah Nusantara.

## Fitur

- **Dashboard** — KPI aset dan ruangan, kondisi kursi, status ruangan, grafik kategori, peringatan stok, tiket terbaru, peminjaman jatuh tempo, jadwal hari ini, dan ringkasan perangkat.
- **Ruangan & pemesanan** — kartu ruangan, detail kondisi aset per ruangan, kalender pemesanan mingguan, pengajuan dan persetujuan pemesanan, serta label QR ruangan.
- **Aset** — pencatatan aset per unit dan massal, filter lanjutan, impor Excel/CSV, ekspor, label QR siap cetak, pemindaian QR, ubah status, pengaturan jumlah stok, penghapusan aset (disposal), dan pemulihan.
- **Peminjaman** — pengajuan oleh guru/staf, persetujuan admin, pengembalian, deteksi keterlambatan, dan notifikasi.
- **Tiket kerusakan** — laporan dengan foto, prioritas, penugasan teknisi, riwayat proses, biaya perbaikan, dan pembaruan status aset otomatis.
- **Mutasi aset** — pemindahan aset antarruangan, termasuk pemecahan lot aset massal.
- **Stock opname** — sesi penghitungan fisik per ruangan, pencatatan selisih, dan penyelesaian opname.
- **Laporan** — rekap inventaris, kerusakan, dan pemanfaatan ruangan; ekspor **PDF, Excel, dan CSV**.
- **Notifikasi & audit log** — pusat notifikasi pengguna dan jejak audit perubahan data.
- **Pengaturan** — profil sekolah, ambang peringatan, pengguna dan peran, gedung, serta kategori aset.
- **RBAC** — Super Admin, Admin Sarpras, Guru/Staf, Teknisi, dan Viewer.

## Teknologi

- PHP 8.4+ / Laravel 13
- Inertia.js + React 19
- Tailwind CSS 4 + Recharts + Lucide
- MySQL / MariaDB (XAMPP)
- `endroid/qr-code` (QR), `barryvdh/laravel-dompdf` (PDF), `phpoffice/phpspreadsheet` (Excel)

## Persiapan

Pastikan PHP, Composer, Node.js, dan MySQL sudah tersedia.

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate
```

Buat database MySQL:

```bash
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS inventra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Sesuaikan `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di `.env` bila perlu. Konfigurasi bawaan menggunakan XAMPP: host `127.0.0.1`, user `root`, tanpa password.

Migrasi dan isi data demo:

```bash
php artisan migrate:fresh --seed
php artisan storage:link
```

Build aset frontend dan jalankan aplikasi:

```bash
npm run build
php artisan serve
```

Buka `http://127.0.0.1:8000`.

Untuk pengembangan frontend dengan hot reload, jalankan `npm run dev` di terminal terpisah.

## Akun Demo

Semua akun menggunakan kata sandi **`password`**.

| Peran | Email |
| --- | --- |
| Super Admin | `admin@inventra.sch.id` |
| Admin Sarpras | `sarpras@inventra.sch.id` |
| Guru / Staf | `guru@inventra.sch.id` |
| Teknisi | `teknisi@inventra.sch.id` |
| Viewer | `viewer@inventra.sch.id` |

Akun guru lain yang tersedia: `dewi@inventra.sch.id`, `ahmad@inventra.sch.id`, `siti@inventra.sch.id`, `hendra@inventra.sch.id`, dan `staff@inventra.sch.id`.

## Hak Akses Singkat

| Peran | Akses utama |
| --- | --- |
| Super Admin | Seluruh fitur, termasuk pengelolaan pengguna |
| Admin Sarpras | Aset, ruangan, pemesanan, peminjaman, tiket, mutasi, opname, laporan, pengaturan |
| Guru / Staf | Dashboard, pemesanan ruangan, peminjaman, laporan kerusakan |
| Teknisi | Dashboard, tiket kerusakan, peminjaman, pengembalian aset |
| Viewer | Dashboard, ruangan, aset, laporan (hanya baca) |

## Catatan

- Data demo dapat dibuat ulang kapan saja dengan `php artisan migrate:fresh --seed`.
- Pemindaian QR melalui kamera membutuhkan akses `localhost` atau HTTPS.
- Email notifikasi menggunakan `MAIL_MAILER=log` pada konfigurasi demo; tautan reset kata sandi dapat dilihat di `storage/logs/laravel.log`.
- Zona waktu aplikasi: `Asia/Jakarta`; locale: `id`.
- Direktori foto aset dan tiket berada di `storage/app/public` (sudah diakses melalui `public/storage`).

## Pengujian

```bash
php artisan test
npm run build
```
