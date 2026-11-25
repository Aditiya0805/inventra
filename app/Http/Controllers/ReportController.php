<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetMutation;
use App\Models\Building;
use App\Models\DamageTicket;
use App\Models\Loan;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\StockOpname;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $report = $this->buildReport($filters);

        return Inertia::render('Reports/Index', [
            'filters' => $filters,
            'report' => $report,
            'rooms' => Room::with('building:id,name')->orderBy('name')->get(['id', 'name', 'building_id']),
            'categories' => AssetCategory::orderBy('name')->get(['id', 'name']),
            'buildings' => Building::orderBy('name')->get(['id', 'name']),
            'opnames' => StockOpname::with('room:id,name')->latest('date')->limit(5)->get(),
        ]);
    }

    public function export(Request $request): StreamedResponse|\Illuminate\Http\Response
    {
        $filters = $this->filters($request);
        $report = $this->buildReport($filters);
        $format = $request->string('format', 'pdf')->toString();
        $table = $this->table($report);
        $filename = 'laporan-'.$filters['type'].'-'.now()->format('Ymd-His');

        if ($format === 'pdf') {
            return Pdf::loadView('reports.pdf', [
                ...$table,
                'filters' => $filters,
                'schoolName' => \App\Models\Setting::get('school_name', 'MA Muhammadiyah Bandar Lampung'),
                'address' => \App\Models\Setting::get('school_address', 'Jl. Pulau Sangiang RT 07 LK II, Sukarame, Kota Bandar Lampung, Lampung 35131'),
                'headmaster' => \App\Models\Setting::get('headmaster', 'Hadi Sururudin, S.Pd.I., M.Pd.'),
            ])->setPaper('a4', 'landscape')->download($filename.'.pdf');
        }

        if ($format === 'csv') {
            return response()->streamDownload(function () use ($table) {
                $handle = fopen('php://output', 'w');
                fwrite($handle, "\xEF\xBB\xBF");
                fputcsv($handle, $table['headers'], ';');
                foreach ($table['rows'] as $row) {
                    fputcsv($handle, $row, ';');
                }
                fclose($handle);
            }, $filename.'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(ucfirst($filters['type']));
        $sheet->fromArray($table['headers'], null, 'A1');
        $sheet->fromArray($table['rows'], null, 'A2');
        $sheet->getStyle('A1:'.$sheet->getHighestColumn().'1')->getFont()->setBold(true);

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename.'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    private function filters(Request $request): array
    {
        return [
            'type' => $request->string('type', 'inventaris')->toString(),
            'from' => $request->filled('from') ? Carbon::parse($request->input('from'))->toDateString() : now()->startOfMonth()->toDateString(),
            'to' => $request->filled('to') ? Carbon::parse($request->input('to'))->toDateString() : now()->endOfMonth()->toDateString(),
            'room_id' => $request->integer('room_id') ?: null,
            'category_id' => $request->integer('category_id') ?: null,
            'building_id' => $request->integer('building_id') ?: null,
        ];
    }

    private function buildReport(array $filters): array
    {
        $type = $filters['type'];
        $from = Carbon::parse($filters['from'])->startOfDay();
        $to = Carbon::parse($filters['to'])->endOfDay();

        if ($type === 'kerusakan') {
            $tickets = DamageTicket::with(['asset:id,code,name', 'room:id,name', 'reporter:id,name', 'technician:id,name'])
                ->whereBetween('created_at', [$from, $to])
                ->when($filters['room_id'], fn ($q, $v) => $q->where('room_id', $v))
                ->when($filters['category_id'], fn ($q, $v) => $q->whereHas('asset', fn ($a) => $a->where('category_id', $v)))
                ->latest()
                ->get();

            $statusSummary = collect(DamageTicket::STATUSES)->map(fn ($label, $key) => [
                'label' => $label,
                'key' => $key,
                'count' => $tickets->where('status', $key)->count(),
            ])->values();

            $byAsset = $tickets->filter(fn ($t) => $t->asset)
                ->groupBy('asset_id')
                ->map(fn ($group) => [
                    'asset' => $group->first()->asset?->name,
                    'code' => $group->first()->asset?->code,
                    'tickets' => $group->count(),
                    'cost' => (float) $group->sum('cost'),
                ])
                ->sortByDesc('tickets')
                ->take(6)
                ->values();

            return [
                'type' => $type,
                'total_cost' => (float) $tickets->sum('cost'),
                'ticket_count' => $tickets->count(),
                'open_count' => $tickets->whereIn('status', ['dilaporkan', 'diverifikasi', 'dalam_perbaikan'])->count(),
                'resolved_count' => $tickets->whereIn('status', ['selesai', 'tidak_dapat_diperbaiki'])->count(),
                'status_summary' => $statusSummary,
                'by_asset' => $byAsset,
                'tickets' => $tickets->take(100)->map(fn ($ticket) => [
                    'code' => $ticket->code,
                    'title' => $ticket->title,
                    'asset' => $ticket->asset?->name,
                    'room' => $ticket->room?->name,
                    'urgency' => DamageTicket::URGENCIES[$ticket->urgency] ?? $ticket->urgency,
                    'status' => $ticket->statusLabel(),
                    'reporter' => $ticket->reporter?->name,
                    'technician' => $ticket->technician?->name,
                    'cost' => (float) $ticket->cost,
                    'created_at' => $ticket->created_at?->format('d/m/Y'),
                ])->values(),
            ];
        }

        if ($type === 'pemanfaatan') {
            $bookings = RoomBooking::with(['room:id,name', 'user:id,name'])
                ->whereBetween('starts_at', [$from, $to])
                ->when($filters['room_id'], fn ($q, $v) => $q->where('room_id', $v))
                ->get();

            $roomUtilization = $bookings->groupBy('room_id')->map(function ($group) {
                $room = $group->first()->room;
                $minutes = $group->sum(fn ($b) => $b->starts_at->diffInMinutes($b->ends_at));

                return [
                    'room' => $room?->name,
                    'bookings' => $group->count(),
                    'approved' => $group->where('status', 'disetujui')->count(),
                    'hours' => round($minutes / 60, 1),
                ];
            })->sortByDesc('bookings')->values();

            $loans = Loan::with(['asset:id,code,name,category_id', 'asset.category:id,name'])
                ->whereBetween('start_date', [$from, $to])
                ->when($filters['category_id'], fn ($q, $v) => $q->whereHas('asset', fn ($a) => $a->where('category_id', $v)))
                ->get();

            $loanByCategory = $loans->groupBy(fn ($loan) => $loan->asset?->category?->name ?? 'Lainnya')
                ->map(fn ($group, $name) => [
                    'category' => $name,
                    'loans' => $group->count(),
                    'quantity' => (int) $group->sum('quantity'),
                ])->sortByDesc('loans')->values();

            return [
                'type' => $type,
                'booking_count' => $bookings->count(),
                'booking_hours' => round($bookings->sum(fn ($b) => $b->starts_at->diffInMinutes($b->ends_at)) / 60, 1),
                'loan_count' => $loans->count(),
                'loan_quantity' => (int) $loans->sum('quantity'),
                'room_utilization' => $roomUtilization,
                'loan_by_category' => $loanByCategory,
                'recent_bookings' => $bookings->sortByDesc('starts_at')->take(20)->values()->map(fn ($b) => [
                    'code' => $b->code,
                    'room' => $b->room?->name,
                    'title' => $b->title,
                    'user' => $b->user?->name,
                    'starts_at' => $b->starts_at?->format('d/m/Y H:i'),
                    'status' => RoomBooking::STATUSES[$b->status] ?? $b->status,
                ]),
            ];
        }

        $assets = Asset::with(['category', 'room.building', 'stock'])
            ->when($filters['room_id'], fn ($q, $v) => $q->where('room_id', $v))
            ->when($filters['category_id'], fn ($q, $v) => $q->where('category_id', $v))
            ->when($filters['building_id'], fn ($q, $v) => $q->whereHas('room', fn ($r) => $r->where('building_id', $v)))
            ->get();

        $byRoom = $assets->groupBy('room_id')->map(function ($group) {
            $room = $group->first()->room;
            $summary = ['total' => 0, 'good' => 0, 'damaged' => 0, 'repair' => 0, 'lost' => 0, 'value' => 0];
            foreach ($group as $asset) {
                $qty = $asset->quantitySummary();
                $summary['total'] += $qty['total'];
                $summary['good'] += $qty['tersedia'] + $qty['dipakai'];
                $summary['damaged'] += $qty['rusak'];
                $summary['repair'] += $qty['perbaikan'];
                $summary['lost'] += $qty['hilang'];
                $summary['value'] += (float) $asset->value * max($qty['total'], 1);
            }

            return [
                'room' => $room?->name ?? 'Tanpa Ruangan',
                'building' => $room?->building?->name,
                ...$summary,
            ];
        })->sortBy('room')->values();

        $byCategory = $assets->groupBy('category_id')->map(function ($group) {
            $category = $group->first()->category;
            $qty = 0;
            $damaged = 0;
            foreach ($group as $asset) {
                $summary = $asset->quantitySummary();
                $qty += $summary['total'];
                $damaged += $summary['rusak'];
            }

            return [
                'category' => $category?->name ?? 'Tanpa Kategori',
                'assets' => $group->count(),
                'quantity' => $qty,
                'damaged' => $damaged,
                'value' => (float) $group->sum('value'),
            ];
        })->sortByDesc('quantity')->values();

        return [
            'type' => $type,
            'asset_records' => $assets->count(),
            'total_quantity' => $byRoom->sum('total'),
            'damaged' => $byRoom->sum('damaged'),
            'repair' => $byRoom->sum('repair'),
            'lost' => $byRoom->sum('lost'),
            'value' => $assets->sum('value'),
            'by_room' => $byRoom,
            'by_category' => $byCategory,
            'mutations' => AssetMutation::whereBetween('moved_at', [$from, $to])->count(),
            'opname_count' => StockOpname::whereBetween('date', [$from, $to])->count(),
        ];
    }

    private function table(array $report): array
    {
        if ($report['type'] === 'kerusakan') {
            return [
                'title' => 'Laporan Kerusakan & Biaya Perbaikan',
                'headers' => ['Kode', 'Judul', 'Aset', 'Ruangan', 'Urgensi', 'Status', 'Pelapor', 'Teknisi', 'Biaya (Rp)', 'Tanggal'],
                'rows' => collect($report['tickets'])->map(fn ($t) => [
                    $t['code'], $t['title'], $t['asset'], $t['room'], $t['urgency'], $t['status'],
                    $t['reporter'], $t['technician'], $t['cost'], $t['created_at'],
                ])->all(),
            ];
        }

        if ($report['type'] === 'pemanfaatan') {
            return [
                'title' => 'Laporan Pemanfaatan Ruangan & Peminjaman',
                'headers' => ['Ruangan', 'Jumlah Pemesanan', 'Disetujui', 'Jam Pemakaian'],
                'rows' => collect($report['room_utilization'])->map(fn ($r) => [
                    $r['room'], $r['bookings'], $r['approved'], $r['hours'],
                ])->all(),
            ];
        }

        return [
            'title' => 'Laporan Inventaris Aset',
            'headers' => ['Ruangan', 'Gedung', 'Total Unit', 'Baik', 'Rusak', 'Perbaikan', 'Hilang', 'Nilai (Rp)'],
            'rows' => collect($report['by_room'])->map(fn ($r) => [
                $r['room'], $r['building'], $r['total'], $r['good'], $r['damaged'], $r['repair'], $r['lost'], $r['value'],
            ])->all(),
        ];
    }
}
