<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetMutation;
use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\Building;
use App\Models\DamageTicket;
use App\Models\Loan;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\Setting;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    private array $bulkCounters = [];

    private array $unitCounters = [];

    public function run(): void
    {
        $superAdmin = User::create([
            'name' => 'Dr. Sri Wahyuni, M.Pd.',
            'email' => 'admin@inventra.sch.id',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'phone' => '0812-3456-7890',
            'job_title' => 'Kepala Sekolah',
            'is_active' => true,
        ]);

        $adminSarpras = User::create([
            'name' => 'Budi Santoso, S.Pd.',
            'email' => 'sarpras@inventra.sch.id',
            'password' => Hash::make('password'),
            'role' => 'admin_sarpras',
            'phone' => '0813-4567-8901',
            'job_title' => 'Wakil Kepala Sarana Prasarana',
            'is_active' => true,
        ]);

        $guru = User::create([
            'name' => 'Rina Kartika, S.Pd.',
            'email' => 'guru@inventra.sch.id',
            'password' => Hash::make('password'),
            'role' => 'guru',
            'phone' => '0814-5678-9012',
            'job_title' => 'Wali Kelas 7A',
            'is_active' => true,
        ]);

        $teknisi = User::create([
            'name' => 'Agus Prasetyo',
            'email' => 'teknisi@inventra.sch.id',
            'password' => Hash::make('password'),
            'role' => 'teknisi',
            'phone' => '0815-6789-0123',
            'job_title' => 'Teknisi Sarana Prasarana',
            'is_active' => true,
        ]);

        $viewer = User::create([
            'name' => 'Yayasan Nusantara',
            'email' => 'viewer@inventra.sch.id',
            'password' => Hash::make('password'),
            'role' => 'viewer',
            'job_title' => 'Auditor Yayasan',
            'is_active' => true,
        ]);

        $guruLain = collect([
            ['Dewi Lestari, S.Pd.', 'dewi@inventra.sch.id', 'Wali Kelas 8A'],
            ['Ahmad Fauzi, S.Kom.', 'ahmad@inventra.sch.id', 'Guru Informatika'],
            ['Siti Nurhaliza, S.Pd.', 'siti@inventra.sch.id', 'Wali Kelas 9B'],
            ['Hendra Gunawan, S.Pd.', 'hendra@inventra.sch.id', 'Guru IPA'],
        ])->map(fn ($data) => User::create([
            'name' => $data[0],
            'email' => $data[1],
            'password' => Hash::make('password'),
            'role' => 'guru',
            'job_title' => $data[2],
            'is_active' => true,
        ]));

        $staff = User::create([
            'name' => 'Maya Sari',
            'email' => 'staff@inventra.sch.id',
            'password' => Hash::make('password'),
            'role' => 'guru',
            'job_title' => 'Staf Tata Usaha',
            'is_active' => true,
        ]);

        $buildings = [
            'A' => Building::create(['code' => 'A', 'name' => 'Gedung A — Kelas 7 & 8', 'floors_count' => 3, 'notes' => 'Ruang kelas lantai 1–3']),
            'B' => Building::create(['code' => 'B', 'name' => 'Gedung B — Laboratorium', 'floors_count' => 2, 'notes' => 'Lab komputer dan IPA']),
            'C' => Building::create(['code' => 'C', 'name' => 'Gedung C — Fasilitas Umum', 'floors_count' => 1, 'notes' => 'Aula, kantor, perpustakaan']),
        ];

        $rooms = collect();
        $roomSpecs = [
            ['A101', 'Ruang 7A', 'kelas', 'A', 1, 36, 'tersedia', $guru],
            ['A102', 'Ruang 7B', 'kelas', 'A', 1, 36, 'tersedia', $guruLain[0]],
            ['A103', 'Ruang 8A', 'kelas', 'A', 1, 36, 'tersedia', $guruLain[1]],
            ['A201', 'Ruang 8B', 'kelas', 'A', 2, 36, 'tersedia', $guruLain[2]],
            ['A202', 'Ruang 9A', 'kelas', 'A', 2, 36, 'tersedia', $guruLain[3]],
            ['A203', 'Ruang 9B', 'kelas', 'A', 2, 36, 'tersedia', $guruLain[2]],
            ['B101', 'Lab Komputer', 'laboratorium', 'B', 1, 36, 'tersedia', $guruLain[1]],
            ['B102', 'Lab IPA', 'laboratorium', 'B', 1, 32, 'perawatan', $guruLain[3]],
            ['B201', 'Perpustakaan', 'perpustakaan', 'B', 2, 60, 'tersedia', $staff],
            ['C101', 'Aula Serbaguna', 'aula', 'C', 1, 200, 'tersedia', $adminSarpras],
            ['C102', 'Ruang Guru', 'ruang_guru', 'C', 1, 30, 'tersedia', $guru],
            ['C103', 'Kantor Kepala Sekolah', 'kantor', 'C', 1, 12, 'tersedia', $superAdmin],
            ['C104', 'Mushola', 'mushola', 'C', 1, 50, 'tersedia', $staff],
            ['C105', 'Kantin Sekolah', 'kantin', 'C', 1, 40, 'tersedia', $staff],
        ];

        foreach ($roomSpecs as [$code, $name, $type, $building, $floor, $capacity, $status, $pic]) {
            $rooms[$code] = Room::create([
                'building_id' => $buildings[$building]->id,
                'code' => $code,
                'name' => $name,
                'type' => $type,
                'floor' => $floor,
                'capacity' => $capacity,
                'status' => $status,
                'responsible_user_id' => $pic->id,
            ]);
        }

        $categories = collect();
        $catSpecs = [
            ['Kursi', 'furniture', 'bulk', 'armchair', 'emerald'],
            ['Meja', 'furniture', 'bulk', 'table', 'amber'],
            ['Papan Tulis', 'furniture', 'individual', 'presentation', 'slate'],
            ['Printer', 'perangkat', 'individual', 'printer', 'blue'],
            ['Proyektor', 'perangkat', 'individual', 'projector', 'violet'],
            ['Komputer', 'perangkat', 'individual', 'monitor', 'cyan'],
            ['Laptop', 'perangkat', 'individual', 'laptop', 'indigo'],
            ['AC', 'perangkat', 'individual', 'wind', 'sky'],
            ['Kipas Angin', 'perangkat', 'individual', 'fan', 'teal'],
            ['Lemari', 'furniture', 'individual', 'archive', 'orange'],
            ['Sound System', 'perangkat', 'individual', 'speaker', 'fuchsia'],
            ['Microphone', 'perangkat', 'individual', 'mic', 'purple'],
            ['Jam Dinding', 'lainnya', 'individual', 'clock', 'stone'],
            ['Tempat Sampah', 'lainnya', 'bulk', 'trash', 'lime'],
            ['Tinta Printer', 'consumable', 'bulk', 'droplet', 'rose'],
            ['Kertas HVS', 'consumable', 'bulk', 'file', 'zinc'],
        ];

        foreach ($catSpecs as [$name, $group, $tracking, $icon, $color]) {
            $categories[$name] = AssetCategory::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'group' => $group,
                'tracking_type' => $tracking,
                'icon' => $icon,
                'color' => $color,
                'min_stock' => in_array($name, ['Tinta Printer', 'Kertas HVS'], true) ? ($name === 'Tinta Printer' ? 4 : 10) : null,
            ]);
        }

        $makeBulk = function (string $name, string $category, ?Room $room, array $qty, array $extra = []) {
            $cat = AssetCategory::where('name', $category)->firstOrFail();
            $prefix = match ($category) {
                'Kursi' => 'KUR',
                'Meja' => 'MEJ',
                'Tempat Sampah' => 'SMP',
                'Tinta Printer' => 'TNT',
                'Kertas HVS' => 'KTS',
                default => strtoupper(substr($category, 0, 3)),
            };
            $this->bulkCounters[$prefix] = ($this->bulkCounters[$prefix] ?? 0) + 1;
            $total = array_sum($qty);

            $asset = Asset::create([
                'code' => $prefix.'-'.str_pad((string) $this->bulkCounters[$prefix], 4, '0', STR_PAD_LEFT),
                'name' => $name,
                'category_id' => $cat->id,
                'room_id' => $room?->id,
                'status' => 'tersedia',
                'acquisition_date' => $extra['acquisition_date'] ?? Carbon::create(2022, 7, 15),
                'value' => $extra['value'] ?? 0,
                'funding_source' => $extra['funding_source'] ?? 'BOS',
                'is_consumable' => $cat->group === 'consumable',
                'min_stock' => $extra['min_stock'] ?? $cat->min_stock,
                'notes' => $extra['notes'] ?? null,
            ]);

            $asset->stock()->create([
                'room_id' => $room?->id,
                'qty_available' => $qty['tersedia'] ?? 0,
                'qty_in_use' => $qty['dipakai'] ?? 0,
                'qty_damaged' => $qty['rusak'] ?? 0,
                'qty_repair' => $qty['perbaikan'] ?? 0,
                'qty_lost' => $qty['hilang'] ?? 0,
            ]);

            if ($total === 0) {
                $asset->update(['status' => 'tersedia']);
            }

            return $asset;
        };

        $makeUnit = function (string $name, string $category, ?Room $room, string $status = 'tersedia', array $extra = []) {
            $cat = AssetCategory::where('name', $category)->firstOrFail();
            $prefix = match ($category) {
                'Printer' => 'PRN',
                'Proyektor' => 'PRY',
                'Komputer' => 'KOM',
                'Laptop' => 'LAP',
                'AC' => 'AC',
                'Papan Tulis' => 'PPL',
                'Lemari' => 'LMR',
                'Sound System' => 'SND',
                'Microphone' => 'MIC',
                'Jam Dinding' => 'JAM',
                'Kipas Angin' => 'KPS',
                default => strtoupper(substr($category, 0, 3)),
            };
            $this->unitCounters[$prefix] = ($this->unitCounters[$prefix] ?? 0) + 1;

            return Asset::create([
                'code' => $prefix.'-'.str_pad((string) $this->unitCounters[$prefix], 4, '0', STR_PAD_LEFT),
                'name' => $name,
                'category_id' => $cat->id,
                'room_id' => $room?->id,
                'brand' => $extra['brand'] ?? null,
                'model' => $extra['model'] ?? null,
                'serial_number' => $extra['serial_number'] ?? 'SN'.$this->unitCounters[$prefix].'2026',
                'acquisition_date' => $extra['acquisition_date'] ?? Carbon::create(2023, 1, 10),
                'value' => $extra['value'] ?? 0,
                'funding_source' => $extra['funding_source'] ?? 'BOS',
                'status' => $status,
                'notes' => $extra['notes'] ?? null,
            ]);
        };

        // ——— Ruang kelas ———
        $classSeats = [
            'A101' => ['dipakai' => 32, 'tersedia' => 5, 'rusak' => 2, 'perbaikan' => 1],
            'A102' => ['dipakai' => 35, 'tersedia' => 3, 'rusak' => 2],
            'A103' => ['dipakai' => 36, 'tersedia' => 0, 'rusak' => 2],
            'A201' => ['dipakai' => 38, 'tersedia' => 2],
            'A202' => ['dipakai' => 34, 'tersedia' => 1, 'rusak' => 1],
            'A203' => ['dipakai' => 28, 'tersedia' => 2, 'rusak' => 8, 'perbaikan' => 2],
        ];

        foreach ($classSeats as $roomCode => $qty) {
            $room = $rooms[$roomCode];
            $makeBulk('Kursi Siswa', 'Kursi', $room, $qty, ['value' => 185000]);
            $makeBulk('Meja Siswa', 'Meja', $room, ['dipakai' => (int) ceil(($qty['dipakai'] ?? 0) / 2), 'tersedia' => 2, 'rusak' => 1], ['value' => 425000]);
            $makeBulk('Kursi Guru', 'Kursi', $room, ['dipakai' => 2], ['value' => 350000]);
            $makeBulk('Meja Guru', 'Meja', $room, ['dipakai' => 1, 'tersedia' => 1], ['value' => 850000]);
            $makeBulk('Tempat Sampah', 'Tempat Sampah', $room, ['tersedia' => 2], ['value' => 45000]);
            $makeUnit('Papan Tulis Putih', 'Papan Tulis', $room, 'tersedia', ['brand' => 'Sakura', 'value' => 1350000]);
            $makeUnit('Proyektor Kelas', 'Proyektor', $room, $roomCode === 'A101' ? 'perbaikan' : 'tersedia', ['brand' => 'Epson', 'model' => 'EB-X06', 'value' => 6200000]);
            $makeUnit('AC Split 1.5 PK', 'AC', $room, 'tersedia', ['brand' => 'Daikin', 'model' => 'FTKQ35', 'value' => 4800000]);
            $makeUnit('Lemari Kelas', 'Lemari', $room, 'tersedia', ['brand' => 'Olympic', 'value' => 1750000]);
            $makeUnit('Jam Dinding', 'Jam Dinding', $room, 'tersedia', ['brand' => 'Luminous', 'value' => 85000]);
        }

        // ——— Lab Komputer ———
        $lab = $rooms['B101'];
        $makeBulk('Kursi Siswa', 'Kursi', $lab, ['dipakai' => 30, 'tersedia' => 4, 'rusak' => 2], ['value' => 185000]);
        $makeBulk('Meja Komputer', 'Meja', $lab, ['dipakai' => 18, 'tersedia' => 0, 'rusak' => 1], ['value' => 675000]);
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $lab, ['tersedia' => 2], ['value' => 45000]);
        $makeUnit('Papan Tulis Putih', 'Papan Tulis', $lab, 'tersedia', ['brand' => 'Sakura', 'value' => 1350000]);
        $makeUnit('Proyektor Lab', 'Proyektor', $lab, 'tersedia', ['brand' => 'Epson', 'model' => 'EB-FH52', 'value' => 9800000]);
        $makeUnit('AC Split 2 PK', 'AC', $lab, 'tersedia', ['brand' => 'Panasonic', 'value' => 6200000]);
        $makeUnit('AC Split 2 PK', 'AC', $lab, 'tersedia', ['brand' => 'Panasonic', 'value' => 6200000]);
        $makeUnit('Printer Lab', 'Printer', $lab, 'tersedia', ['brand' => 'Canon', 'model' => 'LBP2900', 'value' => 1850000]);

        $komputerStatuses = array_merge(array_fill(0, 14, 'tersedia'), ['rusak', 'rusak', 'rusak', 'perbaikan', 'perbaikan', 'dipakai']);
        foreach ($komputerStatuses as $i => $status) {
            $makeUnit('Komputer Desktop '.($i + 1), 'Komputer', $lab, $status, [
                'brand' => 'Lenovo', 'model' => 'ThinkCentre M70q', 'value' => 8500000,
            ]);
        }

        // ——— Lab IPA ———
        $labIpa = $rooms['B102'];
        $makeBulk('Kursi Siswa', 'Kursi', $labIpa, ['tersedia' => 20, 'rusak' => 8, 'perbaikan' => 4], ['value' => 185000]);
        $makeBulk('Meja Praktikum', 'Meja', $labIpa, ['tersedia' => 16], ['value' => 1250000]);
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $labIpa, ['tersedia' => 2], ['value' => 45000]);
        $makeUnit('Papan Tulis Putih', 'Papan Tulis', $labIpa, 'tersedia', ['brand' => 'Sakura', 'value' => 1350000]);
        $makeUnit('Proyektor Lab IPA', 'Proyektor', $labIpa, 'rusak', ['brand' => 'BenQ', 'model' => 'MX560', 'value' => 7200000]);
        $makeUnit('Kipas Angin Dinding', 'Kipas Angin', $labIpa, 'tersedia', ['brand' => 'Maspion', 'value' => 450000]);
        $makeUnit('Lemari Alat IPA', 'Lemari', $labIpa, 'tersedia', ['brand' => 'Custom', 'value' => 3200000]);

        // ——— Perpustakaan ———
        $lib = $rooms['B201'];
        $makeBulk('Kursi Baca', 'Kursi', $lib, ['dipakai' => 10, 'tersedia' => 28, 'rusak' => 2], ['value' => 175000]);
        $makeBulk('Meja Baca', 'Meja', $lib, ['dipakai' => 5, 'tersedia' => 5], ['value' => 750000]);
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $lib, ['tersedia' => 2], ['value' => 45000]);
        $makeUnit('Komputer Katalog', 'Komputer', $lib, 'tersedia', ['brand' => 'HP', 'model' => 'ProDesk 400', 'value' => 7200000]);
        $makeUnit('Komputer Katalog 2', 'Komputer', $lib, 'rusak', ['brand' => 'HP', 'model' => 'ProDesk 400', 'value' => 7200000]);
        $makeUnit('Printer Perpustakaan', 'Printer', $lib, 'tersedia', ['brand' => 'Epson', 'model' => 'L3210', 'value' => 2650000]);
        $makeUnit('AC Split 2 PK', 'AC', $lib, 'tersedia', ['brand' => 'Sharp', 'value' => 5900000]);
        $makeUnit('AC Split 2 PK', 'AC', $lib, 'tersedia', ['brand' => 'Sharp', 'value' => 5900000]);
        $makeUnit('Lemari Arsip', 'Lemari', $lib, 'tersedia', ['brand' => 'Brother', 'value' => 2400000]);
        $makeUnit('Lemari Arsip 2', 'Lemari', $lib, 'tersedia', ['brand' => 'Brother', 'value' => 2400000]);

        // ——— Aula ———
        $aula = $rooms['C101'];
        $makeBulk('Kursi Lipat Aula', 'Kursi', $aula, ['tersedia' => 145, 'rusak' => 5], ['value' => 125000]);
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $aula, ['tersedia' => 4], ['value' => 45000]);
        $makeUnit('Sound System Aula', 'Sound System', $aula, 'tersedia', ['brand' => 'Yamaha', 'model' => 'StagePas 600BT', 'value' => 12500000]);
        $makeUnit('Microphone Wireless 1', 'Microphone', $aula, 'tersedia', ['brand' => 'Shure', 'model' => 'BLX24', 'value' => 3200000]);
        $makeUnit('Microphone Wireless 2', 'Microphone', $aula, 'tersedia', ['brand' => 'Shure', 'model' => 'BLX24', 'value' => 3200000]);
        $makeUnit('AC Split 2 PK', 'AC', $aula, 'tersedia', ['brand' => 'Daikin', 'value' => 6200000]);
        $makeUnit('AC Split 2 PK', 'AC', $aula, 'tersedia', ['brand' => 'Daikin', 'value' => 6200000]);
        $makeUnit('Proyektor Aula', 'Proyektor', $aula, 'tersedia', ['brand' => 'Panasonic', 'model' => 'PT-VW360', 'value' => 11500000]);

        // ——— Ruang Guru ———
        $rg = $rooms['C102'];
        $makeBulk('Kursi Guru', 'Kursi', $rg, ['dipakai' => 20, 'tersedia' => 4], ['value' => 350000]);
        $makeBulk('Meja Guru', 'Meja', $rg, ['dipakai' => 12], ['value' => 850000]);
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $rg, ['tersedia' => 2], ['value' => 45000]);
        $makeUnit('Printer Ruang Guru', 'Printer', $rg, 'rusak', ['brand' => 'Canon', 'model' => 'G2770', 'value' => 2850000]);
        $makeUnit('AC Split 2 PK', 'AC', $rg, 'tersedia', ['brand' => 'Panasonic', 'value' => 6200000]);
        $makeUnit('AC Split 2 PK', 'AC', $rg, 'tersedia', ['brand' => 'Panasonic', 'value' => 6200000]);
        $makeUnit('Lemari Arsip Guru', 'Lemari', $rg, 'tersedia', ['brand' => 'Olympic', 'value' => 2100000]);
        $makeUnit('Lemari Arsip Guru 2', 'Lemari', $rg, 'tersedia', ['brand' => 'Olympic', 'value' => 2100000]);
        $makeUnit('Jam Dinding', 'Jam Dinding', $rg, 'tersedia', ['brand' => 'Luminous', 'value' => 85000]);

        // ——— Kantor Kepala Sekolah ———
        $kepsek = $rooms['C103'];
        $makeBulk('Kursi Tamu', 'Kursi', $kepsek, ['dipakai' => 4], ['value' => 650000]);
        $makeBulk('Meja Kerja', 'Meja', $kepsek, ['dipakai' => 2], ['value' => 1850000]);
        $makeUnit('Printer Kepala Sekolah', 'Printer', $kepsek, 'tersedia', ['brand' => 'HP', 'model' => 'LaserJet M404', 'value' => 3450000]);
        $makeUnit('AC Split 1.5 PK', 'AC', $kepsek, 'tersedia', ['brand' => 'Daikin', 'value' => 4800000]);
        $makeUnit('Lemari Pimpinan', 'Lemari', $kepsek, 'tersedia', ['brand' => 'Olympic', 'value' => 2750000]);
        $makeUnit('Laptop Kepala Sekolah', 'Laptop', $kepsek, 'dipakai', ['brand' => 'Lenovo', 'model' => 'ThinkPad E14', 'value' => 13500000]);

        // ——— Mushola & Kantin ———
        $mushola = $rooms['C104'];
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $mushola, ['tersedia' => 2], ['value' => 45000]);
        $makeUnit('Jam Dinding Mushola', 'Jam Dinding', $mushola, 'tersedia', ['brand' => 'Luminous', 'value' => 85000]);
        $makeUnit('Kipas Angin Mushola', 'Kipas Angin', $mushola, 'tersedia', ['brand' => 'Cosmos', 'value' => 380000]);
        $makeUnit('Sound System Mushola', 'Sound System', $mushola, 'tersedia', ['brand' => 'Polytron', 'value' => 2100000]);

        $kantin = $rooms['C105'];
        $makeBulk('Kursi Kantin', 'Kursi', $kantin, ['dipakai' => 20, 'tersedia' => 8, 'rusak' => 2], ['value' => 95000]);
        $makeBulk('Meja Kantin', 'Meja', $kantin, ['dipakai' => 8, 'tersedia' => 2], ['value' => 450000]);
        $makeBulk('Tempat Sampah', 'Tempat Sampah', $kantin, ['tersedia' => 3], ['value' => 45000]);

        // ——— Persediaan habis pakai ———
        $makeBulk('Tinta Printer Hitam', 'Tinta Printer', null, ['tersedia' => 3], ['value' => 85000, 'min_stock' => 4]);
        $makeBulk('Tinta Printer Warna', 'Tinta Printer', null, ['tersedia' => 6], ['value' => 95000, 'min_stock' => 4]);
        $makeBulk('Kertas HVS A4', 'Kertas HVS', null, ['tersedia' => 8], ['value' => 55000, 'min_stock' => 10]);

        // ——— Peminjaman ———
        $printers = Asset::where('name', 'like', '%Printer%')->get();
        $projectors = Asset::where('name', 'like', '%Proyektor%')->get();
        $laptop = Asset::where('name', 'Laptop Kepala Sekolah')->first();
        $mic = Asset::where('name', 'like', 'Microphone%')->first();

        $loans = [
            [
                'asset' => $projectors->firstWhere('room_id', $rooms['A102']->id) ?? $projectors->first(),
                'borrower' => $guru,
                'purpose' => 'Presentasi materi IPS di kelas 7B',
                'start' => now()->subDays(1),
                'due' => now()->addDays(2),
                'status' => 'dipinjam',
                'qty' => 1,
            ],
            [
                'asset' => $laptop,
                'borrower' => $superAdmin,
                'purpose' => 'Rapat dinas dengan pengawas sekolah',
                'start' => now()->subDays(4),
                'due' => now()->subDays(1),
                'status' => 'dipinjam',
                'qty' => 1,
            ],
            [
                'asset' => $projectors->firstWhere('room_id', $rooms['C101']->id) ?? $projectors->last(),
                'borrower' => $guruLain[0],
                'purpose' => 'Gladi bersih pentas seni',
                'start' => now()->addDays(1),
                'due' => now()->addDays(3),
                'status' => 'menunggu',
                'qty' => 1,
            ],
            [
                'asset' => $printers->first(),
                'borrower' => $staff,
                'purpose' => 'Cetak laporan administrasi sekolah',
                'start' => now()->subDays(12),
                'due' => now()->subDays(9),
                'status' => 'dikembalikan',
                'qty' => 1,
            ],
            [
                'asset' => $mic,
                'borrower' => $guruLain[1],
                'purpose' => 'Kegiatan ekstrakurikuler musik',
                'start' => now()->addDays(2),
                'due' => now()->addDays(4),
                'status' => 'menunggu',
                'qty' => 1,
            ],
        ];

        foreach ($loans as $index => $row) {
            if (! $row['asset']) {
                continue;
            }

            Loan::create([
                'code' => 'PJM-'.now()->format('Ym').'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'asset_id' => $row['asset']->id,
                'quantity' => $row['qty'],
                'borrower_id' => $row['borrower']->id,
                'purpose' => $row['purpose'],
                'start_date' => $row['start'],
                'due_date' => $row['due'],
                'status' => $row['status'],
                'approved_by' => $row['status'] === 'menunggu' ? null : $adminSarpras->id,
                'approved_at' => $row['status'] === 'menunggu' ? null : $row['start'],
                'returned_at' => $row['status'] === 'dikembalikan' ? $row['due'] : null,
            ]);

            if ($row['status'] === 'dipinjam') {
                $row['asset']->update(['status' => 'dipinjam']);
            }
        }

        // ——— Pemesanan ruangan ———
        $bookingSpecs = [
            [$aula, $adminSarpras, 'Rapat Koordinasi Yayasan', now()->setTime(8, 0), now()->setTime(10, 0), 'disetujui', 'Rapat pengurus yayasan dengan kepala sekolah.'],
            [$lab, $guruLain[1], 'Praktikum TIK Kelas 8A', now()->setTime(10, 0), now()->setTime(12, 0), 'disetujui', 'Praktikum spreadsheet bab 3.'],
            [$rg, $guru, 'Rapat Wali Kelas', now()->setTime(13, 0), now()->setTime(14, 30), 'disetujui', 'Evaluasi hasil belajar tengah semester.'],
            [$rooms['A101'], $guruLain[0], 'Ujian Matematika Susulan', now()->addDay()->setTime(7, 0), now()->addDay()->setTime(9, 0), 'menunggu', 'Ujian susulan untuk 5 siswa.'],
            [$lib, $staff, 'Kunjungan Literasi Kelas 7', now()->addDay()->setTime(9, 30), now()->addDay()->setTime(11, 0), 'menunggu', 'Sesi membaca bersama.'],
            [$aula, $guruLain[3], 'Gladi Bersih Pentas Seni', now()->addDays(2)->setTime(14, 0), now()->addDays(2)->setTime(16, 0), 'disetujui', 'Latihan gabungan seluruh kelas.'],
        ];

        foreach ($bookingSpecs as $index => [$room, $user, $title, $start, $end, $status, $purpose]) {
            RoomBooking::create([
                'code' => 'BKG-'.now()->format('Ym').'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'room_id' => $room->id,
                'user_id' => $user->id,
                'title' => $title,
                'purpose' => $purpose,
                'starts_at' => $start,
                'ends_at' => $end,
                'status' => $status,
                'approved_by' => $status === 'disetujui' ? $adminSarpras->id : null,
            ]);
        }

        // ——— Tiket kerusakan ———
        $proyektor7A = Asset::where('name', 'Proyektor Kelas')->where('room_id', $rooms['A101']->id)->first();
        $printerRuangGuru = Asset::where('name', 'Printer Ruang Guru')->first();
        $komputerRusak = Asset::where('name', 'like', 'Komputer Desktop%')->where('status', 'rusak')->first();
        $kursi8A = Asset::where('name', 'Kursi Siswa')->where('room_id', $rooms['A103']->id)->first();

        $tickets = [
            [
                'asset' => $proyektor7A,
                'room' => $rooms['A101'],
                'reporter' => $guru,
                'title' => 'Proyektor kelas tidak menyala',
                'description' => 'Saat pembelajaran IPS, proyektor tiba-tiba mati dan lampu indikator berkedip merah.',
                'urgency' => 'tinggi',
                'status' => 'dalam_perbaikan',
                'technician' => $teknisi,
                'cost' => 350000,
                'notes' => 'Lampu proyektor diganti, sedang menunggu sparepart.',
                'created' => now()->subDays(3),
                'resolved' => null,
            ],
            [
                'asset' => $printerRuangGuru,
                'room' => $rooms['C102'],
                'reporter' => $staff,
                'title' => 'Printer ruang guru macet',
                'description' => 'Kertas sering tersangkut dan hasil cetakan bergaris. Sudah dicoba bersihkan roller.',
                'urgency' => 'sedang',
                'status' => 'dilaporkan',
                'technician' => null,
                'cost' => 0,
                'notes' => null,
                'created' => now()->subHours(6),
                'resolved' => null,
            ],
            [
                'asset' => Asset::where('name', 'AC Split 2 PK')->where('room_id', $lab->id)->first(),
                'room' => $lab,
                'reporter' => $guruLain[1],
                'title' => 'AC lab komputer menetes',
                'description' => 'Air menetes ke arah meja komputer nomor 5. Perlu pengecekan saluran pembuangan.',
                'urgency' => 'tinggi',
                'status' => 'diverifikasi',
                'technician' => $teknisi,
                'cost' => 0,
                'notes' => null,
                'created' => now()->subDay(),
                'resolved' => null,
            ],
            [
                'asset' => null,
                'room' => $rooms['A203'],
                'reporter' => $guruLain[2],
                'title' => 'Meja kelas 9B goyang',
                'description' => 'Ada tiga meja siswa yang kaki nya longgar dan goyang saat digunakan.',
                'urgency' => 'rendah',
                'status' => 'dilaporkan',
                'technician' => null,
                'cost' => 0,
                'notes' => null,
                'created' => now()->subHours(20),
                'resolved' => null,
            ],
            [
                'asset' => $komputerRusak,
                'room' => $lab,
                'reporter' => $guruLain[1],
                'title' => 'Komputer tidak bisa booting',
                'description' => 'Komputer menampilkan blue screen saat dinyalakan. Data siswa di dalamnya sudah dibackup.',
                'urgency' => 'sedang',
                'status' => 'selesai',
                'technician' => $teknisi,
                'cost' => 150000,
                'notes' => 'RAM dibersihkan dan sistem diinstal ulang.',
                'created' => now()->subDays(9),
                'resolved' => now()->subDays(8),
            ],
            [
                'asset' => $kursi8A,
                'room' => $rooms['A103'],
                'reporter' => $guruLain[0],
                'title' => 'Kursi siswa patah',
                'description' => 'Satu unit kursi siswa patah pada bagian rangka belakang.',
                'urgency' => 'sedang',
                'status' => 'tidak_dapat_diperbaiki',
                'technician' => $teknisi,
                'cost' => 0,
                'notes' => 'Rangka patah, disarankan diganti unit baru.',
                'created' => now()->subDays(14),
                'resolved' => now()->subDays(13),
            ],
        ];

        foreach ($tickets as $index => $row) {
            $created = $row['created'];
            $ticket = DamageTicket::create([
                'code' => 'TKT-'.$created->format('Ym').'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'asset_id' => $row['asset']?->id,
                'room_id' => $row['room']?->id,
                'reporter_id' => $row['reporter']->id,
                'title' => $row['title'],
                'description' => $row['description'],
                'urgency' => $row['urgency'],
                'status' => $row['status'],
                'technician_id' => $row['technician']?->id,
                'cost' => $row['cost'],
                'repair_notes' => $row['notes'],
                'verified_at' => in_array($row['status'], ['diverifikasi', 'dalam_perbaikan', 'selesai', 'tidak_dapat_diperbaiki'], true) ? $created->copy()->addHours(2) : null,
                'resolved_at' => $row['resolved'],
                'created_at' => $created,
                'updated_at' => $row['resolved'] ?? $created->copy()->addHours(5),
            ]);

            if ($row['asset']) {
                $row['asset']->update(['status' => match ($row['status']) {
                    'dalam_perbaikan' => 'perbaikan',
                    'selesai' => 'tersedia',
                    'tidak_dapat_diperbaiki' => 'rusak',
                    default => 'rusak',
                }]);
            }
        }

        // ——— Mutasi aset ———
        $kursi7A = Asset::where('name', 'Kursi Siswa')->where('room_id', $rooms['A101']->id)->first();
        AssetMutation::create([
            'code' => 'MUT-'.now()->format('Ym').'-001',
            'asset_id' => $kursi7A->id,
            'quantity' => 4,
            'from_room_id' => $rooms['A101']->id,
            'to_room_id' => $rooms['A102']->id,
            'reason' => 'Penyesuaian kebutuhan kursi kelas 7B',
            'moved_by' => $adminSarpras->id,
            'moved_at' => now()->subDays(5),
        ]);

        AssetMutation::create([
            'code' => 'MUT-'.now()->format('Ym').'-002',
            'asset_id' => Asset::where('name', 'Lemari Arsip')->first()->id,
            'quantity' => 1,
            'from_room_id' => $rooms['B201']->id,
            'to_room_id' => $rooms['C102']->id,
            'reason' => 'Ruang arsip perpustakaan dialihkan ke ruang guru',
            'moved_by' => $adminSarpras->id,
            'moved_at' => now()->subDays(2),
        ]);

        // ——— Stock opname ———
        $opname = StockOpname::create([
            'code' => 'OPN-'.now()->format('Ym').'-001',
            'room_id' => $rooms['A101']->id,
            'user_id' => $adminSarpras->id,
            'date' => now()->subDays(6),
            'status' => 'selesai',
            'notes' => 'Stock opname rutin bulanan ruang 7A.',
        ]);

        foreach (Asset::where('room_id', $rooms['A101']->id)->with('stock')->get() as $asset) {
            $systemQty = $asset->isBulk() ? ($asset->stock?->total ?? 0) : 1;
            $counted = $systemQty;
            if ($asset->id === $kursi7A->id) {
                $counted = max(0, $systemQty - 1);
            }

            StockOpnameItem::create([
                'stock_opname_id' => $opname->id,
                'asset_id' => $asset->id,
                'system_qty' => $systemQty,
                'counted_qty' => $counted,
                'difference' => $counted - $systemQty,
                'note' => $counted !== $systemQty ? 'Satu kursi tidak ditemukan saat pengecekan.' : null,
            ]);
        }

        // ——— Pengaturan ———
        $settings = [
            'school_name' => 'SMP Negeri 1 Nusantara',
            'school_address' => 'Jl. Pendidikan No. 1, Kec. Nusantara, Kota Bandung 40123',
            'npsn' => '20301234',
            'headmaster' => 'Dr. Sri Wahyuni, M.Pd.',
            'academic_year' => '2026/2027',
            'school_phone' => '(022) 555-0123',
            'school_email' => 'info@smpn1nusantara.sch.id',
            'alert_threshold' => '15',
            'loan_reminder_days' => '2',
            'email_notifications' => '1',
        ];
        foreach ($settings as $key => $value) {
            Setting::put($key, $value, in_array($key, ['alert_threshold', 'loan_reminder_days', 'email_notifications'], true) ? 'peringatan' : 'sekolah');
        }

        // ——— Notifikasi ———
        $notifications = [
            [$adminSarpras, 'warning', '3 aset rusak di Ruang 9B', 'Persentase aset rusak di Ruang 9B melewati ambang batas 15%. Segera lakukan pengecekan.', route('rooms.show', $rooms['A203'])],
            [$adminSarpras, 'danger', 'Laporan kerusakan baru', 'Printer ruang guru dilaporkan macet oleh Maya Sari.', route('tickets.index')],
            [$superAdmin, 'info', 'Pemesanan ruangan menunggu', 'Ada 2 pengajuan pemesanan ruangan yang menunggu persetujuan.', route('bookings.index')],
            [$guru, 'success', 'Peminjaman disetujui', 'Peminjaman proyektor untuk presentasi IPS telah disetujui.', route('loans.index')],
        ];

        foreach ($notifications as [$user, $type, $title, $message, $url]) {
            AppNotification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'url' => $url,
                'created_at' => now()->subHours(rand(1, 20)),
            ]);
        }

        // ——— Audit log ———
        $auditItems = [
            [$adminSarpras, 'created', 'aset', $proyektor7A->id, 'Menambahkan aset Proyektor Kelas ('.$proyektor7A->code.')', now()->subDays(30)],
            [$adminSarpras, 'updated', 'ruangan', $rooms['B102']->id, 'Mengubah status Lab IPA menjadi perawatan', now()->subDays(4)],
            [$guru, 'created', 'tiket_kerusakan', 1, 'Melaporkan kerusakan: Proyektor kelas tidak menyala', now()->subDays(3)],
            [$teknisi, 'status', 'tiket_kerusakan', 1, 'Memperbarui tiket TKT-202611-001: diverifikasi → dalam_perbaikan', now()->subDays(2)],
            [$adminSarpras, 'created', 'mutasi_aset', 1, 'Memutasi 4 Kursi Siswa dari Ruang 7A ke Ruang 7B', now()->subDays(5)],
            [$superAdmin, 'login', 'pengguna', $superAdmin->id, $superAdmin->name.' masuk ke aplikasi', now()->subHours(2)],
            [$adminSarpras, 'updated', 'pengaturan', null, 'Memperbarui ambang peringatan dan notifikasi', now()->subHours(8)],
            [$adminSarpras, 'created', 'stock_opname', $opname->id, 'Memulai stock opname OPN-202611-001 di Ruang 7A', now()->subDays(6)],
        ];

        foreach ($auditItems as [$user, $action, $entity, $entityId, $description, $at]) {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'description' => $description,
                'created_at' => $at,
            ]);
        }
    }
}
