<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Building;
use App\Models\Room;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssetImportExportController extends Controller
{
    private const HEADERS = [
        'Kode', 'Nama', 'Kategori', 'Ruangan', 'Merek', 'Model', 'Nomor Seri',
        'Tanggal Perolehan', 'Nilai', 'Sumber Dana', 'Status', 'Jumlah',
        'Tersedia', 'Dipakai', 'Rusak', 'Perbaikan', 'Hilang', 'Catatan',
        'Habis Pakai', 'Stok Minimum',
    ];

    public function importForm(): Response
    {
        return Inertia::render('Assets/Import', [
            'categories' => AssetCategory::orderBy('name')->get(['id', 'name', 'tracking_type']),
            'importResult' => session('import_result'),
        ]);
    }

    public function template(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Aset');
        $sheet->fromArray(self::HEADERS, null, 'A1');
        $sheet->fromArray([
            '',
            'Kursi Siswa',
            'Kursi',
            'Ruang 7A',
            'Chitose',
            '',
            '',
            now()->format('Y-m-d'),
            185000,
            'BOS',
            'tersedia',
            40,
            5,
            32,
            3,
            0,
            0,
            'Contoh baris aset massal — hapus sebelum impor.',
            'Tidak',
            '',
        ], null, 'A2');

        foreach (range('A', 'T') as $column) {
            $sheet->getColumnDimension($column)->setWidth(16);
        }
        $sheet->getStyle('A1:T1')->getFont()->setBold(true);

        return $this->downloadSpreadsheet($spreadsheet, 'template-impor-aset-inventra.xlsx');
    }

    public function export(Request $request): StreamedResponse
    {
        $format = $request->string('format', 'xlsx')->toString();
        $filters = $request->only(['q', 'category_id', 'room_id', 'building_id', 'status', 'tracking']);

        $query = Asset::query()
            ->with(['category', 'room.building', 'stock'])
            ->when($filters['q'] ?? null, fn ($q, $v) => $q->where(fn ($inner) => $inner
                ->where('name', 'like', "%{$v}%")
                ->orWhere('code', 'like', "%{$v}%")))
            ->when($filters['category_id'] ?? null, fn ($q, $v) => $q->where('category_id', $v))
            ->when($filters['room_id'] ?? null, fn ($q, $v) => $q->where('room_id', $v))
            ->when($filters['building_id'] ?? null, fn ($q, $v) => $q->whereHas('room', fn ($r) => $r->where('building_id', $v)))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['tracking'] ?? null, fn ($q, $v) => $q->whereHas('category', fn ($c) => $c->where('tracking_type', $v)))
            ->orderBy('name');

        $rows = [];
        foreach ($query->cursor() as $asset) {
            $qty = $asset->quantitySummary();
            $rows[] = [
                $asset->code,
                $asset->name,
                $asset->category?->name,
                $asset->room?->name,
                $asset->brand,
                $asset->model,
                $asset->serial_number,
                $asset->acquisition_date?->format('Y-m-d'),
                (float) $asset->value,
                $asset->funding_source,
                $asset->statusLabel(),
                $asset->isBulk() ? $qty['total'] : 1,
                $qty['tersedia'],
                $qty['dipakai'],
                $qty['rusak'],
                $qty['perbaikan'],
                $qty['hilang'],
                $asset->notes,
                $asset->is_consumable ? 'Ya' : 'Tidak',
                $asset->min_stock,
            ];
        }

        AuditLogger::log('export', 'aset', null, 'Mengekspor '.count($rows).' data aset ke '.strtoupper($format));

        if ($format === 'csv') {
            return response()->streamDownload(function () use ($rows) {
                $handle = fopen('php://output', 'w');
                fwrite($handle, "\xEF\xBB\xBF");
                fputcsv($handle, self::HEADERS, ';');
                foreach ($rows as $row) {
                    fputcsv($handle, $row, ';');
                }
                fclose($handle);
            }, 'inventra-aset-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Aset');
        $sheet->fromArray(self::HEADERS, null, 'A1');
        $sheet->fromArray($rows, null, 'A2');
        $sheet->getStyle('A1:T1')->getFont()->setBold(true);
        $sheet->freezePane('A2');
        foreach (range('A', 'T') as $column) {
            $sheet->getColumnDimension($column)->setWidth(16);
        }

        return $this->downloadSpreadsheet($spreadsheet, 'inventra-aset-'.now()->format('Ymd-His').'.xlsx');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $errors = [];
        $success = 0;
        $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);

        if (count($rows) < 2) {
            return back()->with('error', 'Berkas tidak memiliki baris data.');
        }

        $rawHeaders = array_shift($rows);
        $headers = array_map(function ($header) {
            $header = Str::lower(trim((string) $header));

            return match (true) {
                str_contains($header, 'kode') => 'code',
                str_contains($header, 'nama') => 'name',
                str_contains($header, 'kategori') => 'category',
                str_contains($header, 'ruang') => 'room',
                str_contains($header, 'merek') => 'brand',
                str_contains($header, 'model') => 'model',
                str_contains($header, 'seri') => 'serial_number',
                str_contains($header, 'perolehan') || str_contains($header, 'tanggal') => 'acquisition_date',
                str_contains($header, 'nilai') || str_contains($header, 'harga') => 'value',
                str_contains($header, 'dana') => 'funding_source',
                str_contains($header, 'status') => 'status',
                str_contains($header, 'jumlah') => 'quantity',
                str_contains($header, 'tersedia') => 'qty_available',
                str_contains($header, 'dipakai') => 'qty_in_use',
                str_contains($header, 'rusak') => 'qty_damaged',
                str_contains($header, 'perbaikan') => 'qty_repair',
                str_contains($header, 'hilang') => 'qty_lost',
                str_contains($header, 'catatan') => 'notes',
                str_contains($header, 'habis') => 'is_consumable',
                str_contains($header, 'minimum') || str_contains($header, 'min') => 'min_stock',
                default => null,
            };
        }, $rawHeaders);

        if (! in_array('name', $headers, true) || ! in_array('category', $headers, true)) {
            return back()->with('error', 'Format tidak dikenali. Gunakan template impor yang disediakan (kolom Nama dan Kategori wajib ada).');
        }

        $categories = AssetCategory::all()->keyBy(fn ($c) => Str::lower($c->name));
        $rooms = Room::all();
        $roomLookup = [];
        foreach ($rooms as $room) {
            $roomLookup[Str::lower($room->name)] = $room;
            $roomLookup[Str::lower($room->code)] = $room;
        }

        DB::transaction(function () use ($rows, $headers, $categories, $roomLookup, &$errors, &$success) {
            foreach ($rows as $index => $row) {
                $line = $index + 2;
                $data = [];
                foreach ($headers as $column => $key) {
                    if ($key) {
                        $data[$key] = $row[$column] ?? null;
                    }
                }

                $name = trim((string) ($data['name'] ?? ''));
                if ($name === '') {
                    continue;
                }

                $categoryName = trim((string) ($data['category'] ?? ''));
                $category = $categories[Str::lower($categoryName)] ?? null;
                if (! $category) {
                    $errors[] = "Baris {$line}: kategori \"{$categoryName}\" tidak ditemukan.";
                    continue;
                }

                $roomName = trim((string) ($data['room'] ?? ''));
                $room = $roomName !== '' ? ($roomLookup[Str::lower($roomName)] ?? null) : null;
                if ($roomName !== '' && ! $room) {
                    $errors[] = "Baris {$line}: ruangan \"{$roomName}\" tidak ditemukan.";
                    continue;
                }

                $code = trim((string) ($data['code'] ?? ''));
                if ($code !== '' && Asset::withTrashed()->where('code', $code)->exists()) {
                    $errors[] = "Baris {$line}: kode aset \"{$code}\" sudah digunakan.";
                    continue;
                }
                if ($code === '') {
                    $code = Asset::generateCode($category);
                }

                $statusKey = $this->statusKey((string) ($data['status'] ?? ''));
                $isBulk = $category->isBulk();
                $qtyAvailable = max(0, (int) ($data['qty_available'] ?? 0));
                $qtyUsed = max(0, (int) ($data['qty_in_use'] ?? 0));
                $qtyDamaged = max(0, (int) ($data['qty_damaged'] ?? 0));
                $qtyRepair = max(0, (int) ($data['qty_repair'] ?? 0));
                $qtyLost = max(0, (int) ($data['qty_lost'] ?? 0));
                $quantity = max(0, (int) ($data['quantity'] ?? 0));

                if ($isBulk && ($qtyAvailable + $qtyUsed + $qtyDamaged + $qtyRepair + $qtyLost) === 0) {
                    $qtyAvailable = max(1, $quantity);
                }

                $date = $data['acquisition_date'] ?? null;
                if (is_numeric($date)) {
                    $date = ExcelDate::excelToDateTimeObject($date)->format('Y-m-d');
                } elseif ($date) {
                    try {
                        $date = Carbon::parse($date)->format('Y-m-d');
                    } catch (\Throwable) {
                        $date = null;
                    }
                }

                try {
                    $asset = Asset::create([
                        'code' => $code,
                        'name' => $name,
                        'category_id' => $category->id,
                        'room_id' => $room?->id,
                        'brand' => $this->stringOrNull($data['brand'] ?? null),
                        'model' => $this->stringOrNull($data['model'] ?? null),
                        'serial_number' => $this->stringOrNull($data['serial_number'] ?? null),
                        'acquisition_date' => $date,
                        'value' => $this->parseNumber($data['value'] ?? 0),
                        'funding_source' => $this->stringOrNull($data['funding_source'] ?? null),
                        'status' => $isBulk ? 'tersedia' : $statusKey,
                        'notes' => $this->stringOrNull($data['notes'] ?? null),
                        'is_consumable' => $this->parseBool($data['is_consumable'] ?? false),
                        'min_stock' => ($data['min_stock'] ?? null) !== null && ($data['min_stock'] ?? null) !== '' ? (int) $data['min_stock'] : null,
                    ]);

                    if ($isBulk) {
                        $asset->stock()->create([
                            'room_id' => $room?->id,
                            'qty_available' => $qtyAvailable,
                            'qty_in_use' => $qtyUsed,
                            'qty_damaged' => $qtyDamaged,
                            'qty_repair' => $qtyRepair,
                            'qty_lost' => $qtyLost,
                        ]);
                    }

                    $success++;
                } catch (\Throwable $e) {
                    $errors[] = "Baris {$line}: ".$e->getMessage();
                }
            }
        });

        AuditLogger::log('import', 'aset', null, "Mengimpor {$success} aset dari berkas Excel/CSV");

        return redirect()->route('assets.import')->with('import_result', [
            'success' => $success,
            'failed' => count($errors),
            'errors' => array_slice($errors, 0, 20),
        ]);
    }

    private function downloadSpreadsheet(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function statusKey(string $status): string
    {
        $normalized = Str::lower(trim($status));

        return match (true) {
            str_contains($normalized, 'dipinjam') => 'dipinjam',
            str_contains($normalized, 'dipakai') => 'dipakai',
            str_contains($normalized, 'perbaikan') => 'perbaikan',
            str_contains($normalized, 'rusak') => 'rusak',
            str_contains($normalized, 'hilang') => 'hilang',
            str_contains($normalized, 'hapus') => 'dihapuskan',
            default => 'tersedia',
        };
    }

    private function parseNumber(mixed $value): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        $value = preg_replace('/[^0-9,.\-]/', '', (string) $value);
        if (str_contains($value, ',')) {
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);
        } else {
            $value = str_replace('.', '', $value);
        }

        return (float) $value;
    }

    private function parseBool(mixed $value): bool
    {
        return in_array(Str::lower(trim((string) $value)), ['1', 'ya', 'yes', 'true', 'y'], true);
    }

    private function stringOrNull(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
